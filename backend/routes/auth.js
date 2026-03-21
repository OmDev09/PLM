const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST api/auth/login
// Hackathon logic: Will auto-register the user if they don't exist
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user = await User.findOne({ email });

        // Auto-register for hackathon demo purposes
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                email,
                password: hashedPassword,
                role: role || 'Engineer' // default to Engineer if not provided
            });
            await user.save();
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'hackathon_secret',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, email: user.email });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
