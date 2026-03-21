const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit
// @desc    Get all system audit logs for Reporting view
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('user', 'email role')
            .sort({ createdAt: -1 }) // Newest first
            .limit(200);
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
