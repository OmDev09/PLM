const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ECO = require('../models/ECO');
const EcoStage = require('../models/EcoStage');
const Product = require('../models/Product');
const BoM = require('../models/BoM');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

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
        res.status(500).json({ msg: 'Server Error loading ECOs' });
    }
});

// @route   POST /api/eco/draft
router.post('/draft', auth, async (req, res) => {
    try {
        const { title, type, productId, changes, versionUpdate } = req.body;

        const eco = new ECO({
            title,
            type: type || 'product',
            productId,
            changes: changes || {},
            versionUpdate: versionUpdate !== undefined ? versionUpdate : true,
            status: 'Draft',
            stage: null,
            createdBy: req.user.id
        });

        await eco.save();

        await new AuditLog({
            action: 'ECO_DRAFTED',
            entityId: eco._id,
            oldValue: null,
            newValue: eco.toObject(),
            user: req.user.id
        }).save();

        res.json(eco);
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   POST /api/eco/start
router.post('/start', auth, async (req, res) => {
    try {
        const { title, type, productId, changes, versionUpdate } = req.body;

        // Find FIRST active stage (ignore pseudo-draft stages if they exist)
        const initialStage = await EcoStage.findOne({ isDraft: { $ne: true } }).sort({ sequence: 1 });
        if (!initialStage) return res.status(400).json({ msg: 'No workflow stages configured. Please ask Admin to set up workflow.' });

        const eco = new ECO({
            title,
            type: type || 'product',
            productId,
            changes: changes || {},
            versionUpdate: versionUpdate !== undefined ? versionUpdate : true,
            status: 'Active',
            stage: initialStage._id,
            createdBy: req.user.id
        });

        await eco.save();

        await new AuditLog({
            action: 'ECO_CREATED',
            entityId: eco._id,
            oldValue: null,
            newValue: eco.toObject(),
            user: req.user.id
        }).save();

        res.json(eco);
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// Helper to execute PLM application logic upon finalization
const executeFinalization = async (eco, session) => {
    // PREVENT DUPLICATE KEY INJECTIONS FROM FRONTEND SPREADS
    const safeChanges = { ...eco.changes };
    delete safeChanges._id;
    delete safeChanges.createdAt;
    delete safeChanges.updatedAt;
    delete safeChanges.__v;

    if (eco.type === 'product') {
        const product = await Product.findById(eco.productId).session(session);
        if (!product) throw new Error('Active Product Master not found');

        if (eco.versionUpdate) {
            const oldData = product.toObject();
            delete oldData._id;
            delete oldData.createdAt;
            delete oldData.updatedAt;
            delete oldData.__v;

            product.status = 'archived';
            await product.save({ session });
            const newProduct = new Product({ ...oldData, version: product.version + 1, status: 'active', previousVersionId: product._id, ...safeChanges });
            await newProduct.save({ session });
        } else {
            Object.assign(product, safeChanges);
            await product.save({ session });
        }
    } else if (eco.type === 'bom') {
        const bom = await BoM.findOne({ productId: eco.productId, status: 'active' }).session(session);
        if (!bom) throw new Error('Active BoM not found for this product');

        if (eco.versionUpdate) {
            const oldData = bom.toObject();
            delete oldData._id;
            delete oldData.createdAt;
            delete oldData.updatedAt;
            delete oldData.__v;

            bom.status = 'archived';
            await bom.save({ session });
            const newBom = new BoM({ ...oldData, version: bom.version + 1, status: 'active', previousVersionId: bom._id, components: safeChanges.components || oldData.components, operations: safeChanges.operations || oldData.operations, ...safeChanges });
            await newBom.save({ session });
        } else {
            if (safeChanges.components) bom.components = safeChanges.components;
            if (safeChanges.operations) bom.operations = safeChanges.operations;
            Object.assign(bom, safeChanges);
            await bom.save({ session });
        }
    }
};

// @route   POST /api/eco/:id/start
router.post('/:id/start', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id).populate('stage');
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        if (eco.status !== 'Draft' && eco.stage) {
            return res.status(400).json({ msg: 'Action not allowed in current stage' });
        }

        const newStage = await EcoStage.findOne({ sequence: 2 });
        if (!newStage) return res.status(400).json({ msg: 'Workflow not configured. Please contact Admin.' });

        eco.stage = newStage._id;
        eco.status = 'Active';
        await eco.save();
        res.json(await ECO.findById(eco._id).populate('stage'));
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   POST /api/eco/:id/send-approval
router.post('/:id/send-approval', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id).populate('stage');
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        if (eco.status === 'Completed') return res.status(400).json({ msg: 'ECO already completed' });

        const currentSeq = eco.stage ? eco.stage.sequence : 0;
        const nextStage = await EcoStage.findOne({ sequence: { $gt: currentSeq } }).sort({ sequence: 1 });
        if (!nextStage) return res.status(400).json({ msg: 'Workflow not configured for next stage.' });

        eco.stage = nextStage._id;
        await eco.save();
        res.json(await ECO.findById(eco._id).populate('stage'));
    } catch (err) {
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   POST /api/eco/:id/approve
router.post('/:id/approve', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).populate('stage').session(session);
        if (!eco) throw new Error('ECO not found');

        if (eco.status === 'Completed') throw new Error('ECO already completed');

        const currentSeq = eco.stage ? eco.stage.sequence : 0;
        const nextStage = await EcoStage.findOne({ sequence: { $gt: currentSeq } }).sort({ sequence: 1 }).session(session);

        if (nextStage) {
            eco.stage = nextStage._id;
            if (nextStage.isFinal) {
                eco.status = 'Completed';
                await executeFinalization(eco, session);
            }
        } else {
            eco.status = 'Completed';
            await executeFinalization(eco, session);
        }

        await eco.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json(await ECO.findById(eco._id).populate('stage'));
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ msg: err.message || 'Server Error' });
    }
});

// @route   PUT /api/eco/:id/changes
router.put('/:id/changes', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO target not found' });
        eco.changes = req.body.changes;
        eco.markModified('changes');

        // Dynamic Risk Level Calculation Engine
        let riskLevel = 'Low';
        try {
            if (eco.type === 'product') {
                const product = await Product.findById(eco.productId);
                if (product) {
                    const changesObj = req.body.changes || {};
                    let magnitude = 0;
                    if (changesObj.price !== undefined && changesObj.price !== product.price) magnitude += 1;
                    if (changesObj.costPrice !== undefined && changesObj.costPrice !== product.costPrice) magnitude += 1;

                    const oldAttach = product.attachments || [];
                    const newAttach = changesObj.attachments || oldAttach;
                    magnitude += Math.abs(newAttach.length - oldAttach.length);

                    if (magnitude >= 3) riskLevel = 'High';
                    else if (magnitude === 2) riskLevel = 'Medium';
                }
            } else if (eco.type === 'bom') {
                const bom = await BoM.findOne({ productId: eco.productId, status: 'active' });
                if (bom) {
                    const changesObj = req.body.changes || {};
                    const oldComps = bom.components || [];
                    const newComps = changesObj.components || oldComps;

                    const addedComps = newComps.filter(nc => !oldComps.find(c => c.name === nc.name)).length;
                    const removedComps = oldComps.filter(oc => !newComps.find(c => c.name === oc.name)).length;
                    const modifiedComps = newComps.filter(nc => {
                        const oc = oldComps.find(c => c.name === nc.name);
                        return oc && oc.quantity !== nc.quantity;
                    }).length;

                    let magnitude = addedComps + removedComps + modifiedComps;

                    const oldOps = bom.operations || [];
                    const newOps = changesObj.operations || oldOps;
                    const oldTime = oldOps.reduce((acc, o) => acc + (o.timeMinutes || 0), 0);
                    const newTime = newOps.reduce((acc, o) => acc + (o.timeMinutes || 0), 0);
                    const timeImpact = Math.abs(newTime - oldTime);

                    if (timeImpact >= 30) magnitude += 3;
                    else if (timeImpact >= 10) magnitude += 2;
                    else if (timeImpact > 0) magnitude += 1;

                    if (magnitude >= 4) riskLevel = 'High';
                    else if (magnitude >= 2) riskLevel = 'Medium';
                }
            }
        } catch (e) { console.error("Risk Calc Error:", e); }

        eco.riskLevel = riskLevel;

        await eco.save();
        res.json(eco);
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ msg: err.message || 'Server Error syncing RAM to DB.' });
    }
});

// @route   GET /api/eco/:id/comparison
router.get('/:id/comparison', auth, async (req, res) => {
    try {
        const eco = await ECO.findById(req.params.id).populate('stage').populate('signatures.user', 'email');
        if (!eco) return res.status(404).json({ msg: 'NotFound' });

        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId);
            return res.json({ type: 'product', title: eco.title, targetCurrent: product, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate, stage: eco.stage, signatures: eco.signatures, riskLevel: eco.riskLevel });
        } else if (eco.type === 'bom') {
            const bom = await BoM.findOne({ productId: eco.productId, status: 'active' });
            return res.json({ type: 'bom', title: eco.title, targetCurrent: bom || {}, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate, stage: eco.stage, signatures: eco.signatures, riskLevel: eco.riskLevel });
        }
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
