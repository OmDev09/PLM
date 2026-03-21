const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },

    // Immutability Core
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },

    // Track ancestry (if it was created from a previous version)
    previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
