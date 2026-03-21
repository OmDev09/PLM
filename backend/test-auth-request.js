const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testPost() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plm');
        const User = require('./models/User');

        const user = await User.findOne({ role: 'Admin' }) || await User.findOne();
        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 360000 });

        console.log('Sending request wrapper to http://localhost:5000/api/products...');
        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "FrontEnd Simulation Test",
                price: 15.0,
                costPrice: 5.0,
                attachments: ['dummy.pdf']
            })
        });

        const data = await res.json();
        console.log('Success! Status:', res.status);
        console.log('Result:', data);
    } catch (err) {
        console.error('API Error Response:', err);
    } finally {
        process.exit(0);
    }
}
testPost();
