const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BoM = require('../models/BoM');
const AuditLog = require('../models/AuditLog');

// Get all BoMs (Active, Archived)
router.get('/all', auth, async (req, res) => {
    try {
        const boms = await BoM.find().populate('productId', 'name version').sort({ createdAt: -1 });
        res.json(boms);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create base BoM
router.post('/', auth, async (req, res) => {
    try {
        const { productId, reference, components, operations } = req.body;

        // Ensure no active BoM currently exists for this product
        const existing = await BoM.findOne({ productId, status: 'active' });
        if (existing) return res.status(400).json({ msg: 'An active BoM already exists for this product.' });

        const bom = new BoM({
            productId,
            reference: reference || `BOM-${Math.floor(Math.random() * 10000)}`,
            components: components || [],
            operations: operations || []
        });

        await bom.save();

        await new AuditLog({ action: 'BOM_BASELINE_CREATED', entityId: bom._id, oldValue: null, newValue: bom.toObject(), user: req.user.id }).save();

        res.json(bom);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get BoM by product ID
router.get('/:productId', auth, async (req, res) => {
    try {
        let bom = await BoM.findOne({ productId: req.params.productId, status: 'active' }).populate('productId', 'name version');
        if (!bom) {
            return res.json({ isNew: true });
        }
        res.json(bom);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
