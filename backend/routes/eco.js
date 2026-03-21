const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ECO = require('../models/ECO');
const EcoStage = require('../models/EcoStage');
const Product = require('../models/Product');
const BoM = require('../models/BoM');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const getInitialStage = async (isDraft) => {
    let stage;
    if (isDraft) stage = await EcoStage.findOne({ isDraft: true });
    if (!stage) stage = await EcoStage.findOne().sort({ sequence: 1 });
    return stage;
};

// @route   GET /api/eco
router.get('/', auth, async (req, res) => {
    try {
        const ecos = await ECO.find()
            .populate('createdBy', 'email')
            .populate('productId', 'name version')
            .populate('stage')
            .populate('signatures.user', 'email');
        res.json(ecos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco
router.post('/', auth, async (req, res) => {
    try {
        const { title, type, productId, changes, versionUpdate, status } = req.body;
        const initialStage = await getInitialStage(status === 'draft');
        if (!initialStage) return res.status(500).json({ msg: 'No workflow stages configured. Please ask Admin to setup Settings.' });

        const eco = new ECO({
            title,
            type: type || 'product',
            productId,
            changes: changes || {},
            versionUpdate: versionUpdate !== undefined ? versionUpdate : true,
            stage: initialStage._id,
            createdBy: req.user.id
        });

        await eco.save();

        await new AuditLog({
            action: status === 'draft' ? 'ECO_DRAFTED' : 'ECO_CREATED',
            entityId: eco._id,
            oldValue: null,
            newValue: eco.toObject(),
            user: req.user.id
        }).save();

        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/sign
// @desc    Sign the current stage of the ECO
router.post('/:id/sign', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        const alreadySigned = eco.signatures.find(s => s.stage.toString() === eco.stage.toString() && s.user.toString() === req.user.id);
        if (alreadySigned) return res.status(400).json({ msg: 'You have already signed this stage.' });

        eco.signatures.push({ stage: eco.stage, user: req.user.id });
        await eco.save();
        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/advance
// @desc    Attempt to push the ECO to the next stage, enforcing Required signatures
router.post('/:id/advance', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).populate('stage').session(session);
        if (!eco) throw new Error('ECO not found');

        const currentStage = eco.stage;
        if (!currentStage) throw new Error('ECO is in an invalid stage');
        if (currentStage.isFinal) throw new Error('ECO is already in final stage');

        // Extract signatures for this specific stage
        const currentStageSignatures = eco.signatures.filter(s => s.stage.toString() === currentStage._id.toString()).map(s => s.user.toString());

        // Validate Required Approvers
        if (currentStage.approvals && currentStage.approvals.length > 0) {
            const requiredApprovers = currentStage.approvals.filter(a => a.type === 'required').map(a => a.user.toString());
            const missing = requiredApprovers.filter(ru => !currentStageSignatures.includes(ru));
            if (missing.length > 0) {
                throw new Error('Cannot advance: Missing REQUIRED approvals for this stage.');
            }
        }

        // Find next stage
        const nextStage = await EcoStage.findOne({ sequence: { $gt: currentStage.sequence } }).sort({ sequence: 1 }).session(session);
        if (!nextStage) throw new Error('No subsequent stages configured in workflow matrix.');

        eco.stage = nextStage._id;

        // Execute Application Logic if jumping in to Final Node
        if (nextStage.isFinal) {
            let oldData, entityId;

            if (eco.type === 'product') {
                const product = await Product.findById(eco.productId).session(session);
                if (!product) throw new Error('Active Product Master not found');
                oldData = product.toObject();

                if (eco.versionUpdate) {
                    product.status = 'archived';
                    await product.save({ session });
                    const newProduct = new Product({ ...oldData, _id: undefined, version: oldData.version + 1, status: 'active', previousVersionId: oldData._id, ...eco.changes });
                    await newProduct.save({ session });
                } else {
                    Object.assign(product, eco.changes);
                    await product.save({ session });
                }
            }
            else if (eco.type === 'bom') {
                const bom = await BoM.findOne({ productId: eco.productId, status: 'active' }).session(session);
                if (!bom) throw new Error('Active BoM not found for this product');
                oldData = bom.toObject();

                if (eco.versionUpdate) {
                    bom.status = 'archived';
                    await bom.save({ session });
                    const newBom = new BoM({ ...oldData, _id: undefined, version: oldData.version + 1, status: 'active', previousVersionId: oldData._id, components: eco.changes.components || oldData.components, operations: eco.changes.operations || oldData.operations });
                    await newBom.save({ session });
                } else {
                    if (eco.changes.components) bom.components = eco.changes.components;
                    if (eco.changes.operations) bom.operations = eco.changes.operations;
                    await bom.save({ session });
                }
            }
        }

        await eco.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json(await ECO.findById(eco._id).populate('stage'));
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ msg: err.message || 'Workflow advancement failed' });
    }
});

// @route   GET /api/eco/:id/comparison
router.get('/:id/comparison', auth, async (req, res) => {
    try {
        const eco = await ECO.findById(req.params.id).populate('stage').populate('signatures.user', 'email');
        if (!eco) return res.status(404).json({ msg: 'NotFound' });

        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId);
            return res.json({ type: 'product', title: eco.title, targetCurrent: product, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate, stage: eco.stage, signatures: eco.signatures });
        } else if (eco.type === 'bom') {
            const bom = await BoM.findOne({ productId: eco.productId, status: 'active' });
            return res.json({ type: 'bom', title: eco.title, targetCurrent: bom || {}, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate, stage: eco.stage, signatures: eco.signatures });
        }
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
