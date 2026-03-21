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
// @access  Private (Engineer/Admin)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Engineer' && req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Unauthorized to propose ECOs' });
    }

    try {
        const { title, type, productId, changes, versionUpdate } = req.body;

        let existingEco = await ECO.findOne({ productId, type, status: { $ne: 'done' } });
        if (existingEco) {
            return res.status(400).json({ msg: `An active ECO already exists for this ${type}.` });
        }

        const eco = new ECO({
            title,
            type: type || 'product',
            productId,
            changes,
            versionUpdate: versionUpdate !== undefined ? versionUpdate : true,
            createdBy: req.user.id
        });

        await eco.save();

        await new AuditLog({
            action: 'ECO_PROPOSED',
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

// @route   GET /api/eco
// @desc    Get all ECOs pipeline
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const ecos = await ECO.find().populate('createdBy', 'email').populate('productId', 'name version');
        res.json(ecos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/approve
// @desc    Approve an ECO (Change state to approval)
// @access  Private (Approver/Admin)
router.post('/:id/approve', auth, async (req, res) => {
    if (req.user.role !== 'Approver' && req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Unauthorized to approve ECOs' });
    }

    try {
        let eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });
        if (eco.status !== 'new') return res.status(400).json({ msg: 'ECO is not in a provable state' });

        eco.status = 'approval';
        eco.approvedBy = req.user.id;
        await eco.save();

        await new AuditLog({
            action: 'ECO_APPROVED',
            entityId: eco._id,
            oldValue: { status: 'new' },
            newValue: { status: 'approval', approvedBy: req.user.id },
            user: req.user.id
        }).save();

        res.json(eco);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/eco/:id/apply
// @desc    Apply an ECO via STRICT TRANSACTION (Archiving old, minting new, or in-place)
// @access  Private (Approver/Admin/Engineer)
router.post('/:id/apply', auth, async (req, res) => {
    if (req.user.role === 'Operations') {
        return res.status(403).json({ msg: 'Unauthorized to apply ECOs' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).session(session);
        if (!eco) throw new Error('ECO not found');
        if (eco.status !== 'approval') throw new Error('ECO must be approved before application');

        let oldData, newData, entityId;

        // ---------- PRODUCT ECO LOGIC ----------
        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId).session(session);
            if (!product) throw new Error('Active Product Master not found');
            oldData = product.toObject();

            if (eco.versionUpdate) {
                product.status = 'archived';
                await product.save({ session });

                const newProductData = {
                    ...oldData,
                    _id: undefined,
                    version: oldData.version + 1,
                    status: 'active',
                    previousVersionId: oldData._id,
                    ...eco.changes
                };

                const newProduct = new Product(newProductData);
                await newProduct.save({ session });
                newData = newProduct.toObject();
                entityId = newProduct._id;
            } else {
                Object.assign(product, eco.changes);
                await product.save({ session });
                newData = product.toObject();
                entityId = product._id;
            }
        }
        // ---------- BOM ECO LOGIC ----------
        else if (eco.type === 'bom') {
            const bom = await BoM.findOne({ productId: eco.productId, status: 'active' }).session(session);
            if (!bom) throw new Error('Active BoM not found for this product');
            oldData = bom.toObject();

            if (eco.versionUpdate) {
                bom.status = 'archived';
                await bom.save({ session });

                const newBomData = {
                    ...oldData,
                    _id: undefined,
                    version: oldData.version + 1,
                    status: 'active',
                    previousVersionId: oldData._id,
                    components: eco.changes.components || oldData.components,
                    operations: eco.changes.operations || oldData.operations
                };

                const newBom = new BoM(newBomData);
                await newBom.save({ session });
                newData = newBom.toObject();
                entityId = newBom._id;
            } else {
                if (eco.changes.components) bom.components = eco.changes.components;
                if (eco.changes.operations) bom.operations = eco.changes.operations;
                await bom.save({ session });
                newData = bom.toObject();
                entityId = bom._id;
            }
        } else {
            throw new Error('Invalid ECO Type');
        }

        eco.status = 'done';
        await eco.save({ session });

        await new AuditLog({
            action: eco.versionUpdate ? 'ECO_APPLIED_VERSIONED' : 'ECO_APPLIED_INPLACE',
            entityId: entityId,
            oldValue: oldData,
            newValue: newData,
            user: req.user.id
        }).save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Success. Pipeline mutated.', target: eco.type });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Error executing atomic application transaction' });
    }
});

// @route   GET /api/eco/:id/comparison
// @desc    Get visual diff data for an ECO
// @access  Private
router.get('/:id/comparison', auth, async (req, res) => {
    try {
        const eco = await ECO.findById(req.params.id);
        if (!eco) return res.status(404).json({ msg: 'ECO not found' });

        if (eco.type === 'product') {
            const product = await Product.findById(eco.productId);
            return res.json({
                type: 'product',
                title: eco.title,
                targetCurrent: product,
                proposedChanges: eco.changes,
                versionUpdate: eco.versionUpdate
            });
        } else if (eco.type === 'bom') {
            const bom = await BoM.findOne({ productId: eco.productId, status: 'active' });
            return res.json({
                type: 'bom',
                title: eco.title,
                targetCurrent: bom || {},
                proposedChanges: eco.changes,
                versionUpdate: eco.versionUpdate
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
