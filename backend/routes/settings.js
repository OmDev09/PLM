const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EcoStage = require('../models/EcoStage');
const User = require('../models/User');

// @route   GET /api/settings/users
// @desc    Fetch all users for approval dropdowns
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/settings/stages
// @desc    Get all configured ECO stages ordered by sequence
router.get('/stages', auth, async (req, res) => {
    try {
        const stages = await EcoStage.find().populate('approvals.user', 'email role').sort({ sequence: 1 });
        res.json(stages);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/settings/stages
// @desc    Create a new ECO stage
router.post('/stages', auth, async (req, res) => {
    try {
        const { name, sequence, isFinal, isDraft, approvals } = req.body;
        const stage = new EcoStage({ name, sequence, isFinal, isDraft, approvals });
        await stage.save();
        res.json(stage);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/settings/stages/:id
// @desc    Update an ECO stage
router.put('/stages/:id', auth, async (req, res) => {
    try {
        const { name, sequence, isFinal, isDraft, approvals } = req.body;
        let stage = await EcoStage.findById(req.params.id);
        if (!stage) return res.status(404).json({ msg: 'Stage not found' });

        stage.name = name;
        stage.sequence = sequence;
        stage.isFinal = isFinal;
        stage.isDraft = isDraft;
        stage.approvals = approvals;

        await stage.save();
        res.json(await EcoStage.findById(stage._id).populate('approvals.user', 'email role'));
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/settings/stages/:id
router.delete('/stages/:id', auth, async (req, res) => {
    try {
        await EcoStage.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Stage removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
