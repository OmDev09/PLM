const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, async (req, res) => {
    try {
        const { name, price, costPrice, attachments } = req.body;
        const product = new Product({ name, price, costPrice, attachments: attachments || [] });
        await product.save();

        await new AuditLog({ action: 'PRODUCT_CREATED', entityId: product._id, oldValue: null, newValue: product.toObject(), user: req.user.id }).save();

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/active', auth, async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
