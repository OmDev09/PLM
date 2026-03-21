const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BoM = require('../models/BoM');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @route   GET /api/bom/:productId
// @desc    Get the active BoM for a specific product
// @access  Private (All Roles)
router.get('/:productId', auth, async (req, res) => {
    try {
        const bom = await BoM.findOne({ productId: req.params.productId, status: 'active' });
        res.json(bom || { error: 'No active BoM found', isNew: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/bom/:productId
// @desc    Mint baseline (V1) BoM for an active product
// @access  Private (Engineer/Admin)
router.post('/:productId', auth, async (req, res) => {
    if (req.user.role !== 'Engineer' && req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Unauthorized to mint baseline BoMs' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { components, operations } = req.body;

        const existing = await BoM.findOne({ productId: req.params.productId, status: 'active' }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'Active BoM already exists. You must use an ECO to mutate it.' });
        }

        const bom = new BoM({
            productId: req.params.productId,
            components: components || [],
            operations: operations || [],
            version: 1,
            status: 'active'
        });

        await bom.save({ session });

        // Log creation
        await new AuditLog({
            action: 'BOM_BASELINE_CREATED',
            entityId: bom._id,
            oldValue: null,
            newValue: bom.toObject(),
            user: req.user.id
        }).save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json(bom);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/bom/:productId/history
// @desc    Get all historical versions of a BoM
// @access  Private
router.get('/:productId/history', auth, async (req, res) => {
    try {
        const boms = await BoM.find({ productId: req.params.productId }).sort({ version: -1 });
        res.json(boms);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
