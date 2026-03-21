const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BoM = require('../models/BoM');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @route   POST /api/eco
// @desc    Propose a new ECO (for either a Product or a BoM)
router.post('/', auth, async (req, res) => {
    try {
        const { title, type, productId, changes, versionUpdate, status } = req.body;

        // Only block duplicate 'new' or 'approval' if creating active ones.
        if (status !== 'draft') {
            let existingEco = await ECO.findOne({ productId, type, status: { $in: ['new', 'approval'] } });
            if (existingEco) {
                return res.status(400).json({ msg: `An active ECO already exists for this ${type}.` });
            }
        }

        const eco = new ECO({
            title,
            type: type || 'product',
            productId,
            changes: changes || {},
            versionUpdate: versionUpdate !== undefined ? versionUpdate : true,
            status: status || 'draft',
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/eco/:id
// @desc    Update an ECO (e.g. from Draft to New)
router.put('/:id', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'Not found' });

        if (eco.status !== 'draft') return res.status(400).json({ msg: 'Can only update drafts' });

        if (req.body.status) eco.status = req.body.status;
        if (req.body.title) eco.title = req.body.title;
        // Allows updates before starting
        await eco.save();
        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/eco
router.get('/', auth, async (req, res) => {
    try {
        const ecos = await ECO.find().populate('createdBy', 'email').populate('productId', 'name version');
        res.json(ecos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/approve
router.post('/:id/approve', auth, async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });
        if (eco.status !== 'new') return res.status(400).json({ msg: 'ECO is not in a provable state' });

        eco.status = 'approval';
        eco.approvedBy = req.user.id;
        await eco.save();

        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/apply
router.post('/:id/apply', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).session(session);
        if (!eco) throw new Error('ECO not found');
        if (eco.status !== 'approval') throw new Error('ECO must be approved before application');

        let oldData, newData, entityId;

        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId).session(session);
            if (!product) throw new Error('Active Product Master not found');
            oldData = product.toObject();

            if (eco.versionUpdate) {
                product.status = 'archived';
                await product.save({ session });
                const newProduct = new Product({ ...oldData, _id: undefined, version: oldData.version + 1, status: 'active', previousVersionId: oldData._id, ...eco.changes });
                await newProduct.save({ session });
                entityId = newProduct._id;
            } else {
                Object.assign(product, eco.changes);
                await product.save({ session });
                entityId = product._id;
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
                entityId = newBom._id;
            } else {
                if (eco.changes.components) bom.components = eco.changes.components;
                if (eco.changes.operations) bom.operations = eco.changes.operations;
                await bom.save({ session });
                entityId = bom._id;
            }
        }

        eco.status = 'done';
        await eco.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Success' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ msg: err.message || 'Error executing atomic application transaction' });
    }
});

// @route   GET /api/eco/:id/comparison
router.get('/:id/comparison', auth, async (req, res) => {
    try {
        const eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId);
            return res.json({ type: 'product', title: eco.title, targetCurrent: product, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate });
        } else if (eco.type === 'bom') {
            const bom = await BoM.findOne({ productId: eco.productId, status: 'active' });
            return res.json({ type: 'bom', title: eco.title, targetCurrent: bom || {}, proposedChanges: eco.changes, versionUpdate: eco.versionUpdate });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
