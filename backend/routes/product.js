const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// @route   POST api/products
// @desc    Create a new baseline product
router.post('/', auth(['Engineer']), async (req, res) => {
    try {
        const { name, price } = req.body;

        const product = new Product({ name, price, version: 1, status: 'active' });
        await product.save();

        const log = new AuditLog({
            action: 'PRODUCT_CREATED',
            entityId: product._id,
            newValue: { name, price, version: 1 },
            user: req.user.id
        });
        await log.save();

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products
// @desc    Get active products
router.get('/', auth([]), async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/archived
// @desc    Get archived products
router.get('/archived', auth([]), async (req, res) => {
    try {
        const products = await Product.find({ status: 'archived' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
