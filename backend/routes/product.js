const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// @route   POST api/products
// @desc    Create a new baseline product
router.post('/', auth(['Engineer']), async (req, res) => {
    try {
        const { name, price, costPrice, attachments } = req.body;

        // Create the product including the new parameters
        const product = new Product({
            name,
            price: Number(price),
            costPrice: Number(costPrice || 0),
            attachments: attachments || [],
            version: 1,
            status: 'active'
        });

        await product.save();

        const log = new AuditLog({
            action: 'PRODUCT_CREATED',
            entityId: product._id,
            oldValue: null,
            newValue: product.toObject(),
            user: req.user.id
        });

        await log.save();

        res.json(product);
    } catch (err) {
        console.error('API Error /products POST:', err);
        res.status(500).json({ msg: err.message || 'Server Data Write Error' });
    }
});

// @route   GET api/products
// @desc    Get active products
router.get('/', auth([]), async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// @route   GET api/products/archived
// @desc    Get archived products
router.get('/archived', auth([]), async (req, res) => {
    try {
        const products = await Product.find({ status: 'archived' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// @route   GET api/products/all
// @desc    Get ALL products (active + archived) - for version lifecycle UI
//          Sorted: active first, then by name asc, then version desc
router.get('/all', auth([]), async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1, version: -1 });
        // Put active on top within same name group
        const sorted = [
            ...products.filter(p => p.status === 'active'),
            ...products.filter(p => p.status === 'archived'),
        ];
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
