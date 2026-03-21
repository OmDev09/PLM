const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ECO = require('../models/ECO');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// @route   POST api/eco
// @desc    Propose an ECO
router.post('/', auth(['Engineer']), async (req, res) => {
    try {
        const { title, type, productId, changes } = req.body;

        const product = await Product.findById(productId);
        if (!product || product.status !== 'active') {
            return res.status(400).json({ msg: 'Target product must be active.' });
        }

        const eco = new ECO({ title, type: type || 'product', productId, changes, status: 'new', createdBy: req.user.id });
        await eco.save();

        const log = new AuditLog({
            action: 'ECO_CREATED',
            entityId: eco._id,
            newValue: { changes },
            user: req.user.id
        });
        await log.save();

        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/eco
// @desc    List all ECOs
router.get('/', auth([]), async (req, res) => {
    try {
        const ecos = await ECO.find().populate('productId', 'name version').populate('createdBy', 'email').sort({ createdAt: -1 });
        res.json(ecos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/eco/:id/approve
// @desc    Approve ECO
router.post('/:id/approve', auth(['Approver']), async (req, res) => {
    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });
        if (eco.status !== 'new') return res.status(400).json({ msg: 'ECO must be in new state to be approved' });

        eco.status = 'approval';
        eco.approvedBy = req.user.id;
        await eco.save();

        const log = new AuditLog({
            action: 'ECO_APPROVED',
            entityId: eco._id,
            newValue: { status: 'approval' },
            user: req.user.id
        });
        await log.save();

        res.json(eco);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/eco/:id/apply
// @desc    Apply ECO and version the product (TRANSACTION)
router.post('/:id/apply', auth(['Engineer', 'Approver']), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).session(session);
        if (!eco) throw new Error('ECO not found');
        if (eco.status !== 'approval') throw new Error('ECO must be approved first');

        const activeProduct = await Product.findById(eco.productId).session(session);
        if (!activeProduct || activeProduct.status !== 'active') {
            throw new Error('Target product is no longer active.');
        }

        // 1. Archive current product
        activeProduct.status = 'archived';
        await activeProduct.save({ session });

        // 2. Create NEW product version
        // Use .toObject() or extract manually to avoid Mongoose ID conflicts
        const newProductData = {
            name: activeProduct.name,
            price: activeProduct.price,
            ...eco.changes, // Apply changes on top
            version: activeProduct.version + 1,
            status: 'active',
            previousVersionId: activeProduct._id
        };

        // Safety check - delete _id if changes contained it by mistake
        delete newProductData._id;

        const newProduct = new Product(newProductData);
        await newProduct.save({ session });

        // 3. Update ECO state
        eco.status = 'done';
        await eco.save({ session });

        // 4. Log the apply action
        const log = new AuditLog({
            action: 'ECO_APPLIED',
            entityId: eco._id,
            oldValue: { version: activeProduct.version, id: activeProduct._id },
            newValue: { version: newProduct.version, id: newProduct._id },
            user: req.user.id
        });
        await log.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'ECO Applied successfully', newProduct, eco });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction Aborted:', err.message);
        res.status(400).json({ msg: err.message || 'Server Error Transaction Aborted' });
    }
});

// @route   GET api/eco/:id/comparison
// @desc    Show old vs new
router.get('/:id/comparison', auth([]), async (req, res) => {
    try {
        const eco = await ECO.findById(req.params.id).populate('productId');
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        res.json({
            productCurrent: eco.productId,
            proposedChanges: eco.changes
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
