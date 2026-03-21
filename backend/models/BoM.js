const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String }, // cached for easy viewing
    quantity: { type: Number, required: true }
}, { _id: false });

const OperationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., 'Assembly', 'Quality Inspection'
    timeMinutes: { type: Number, required: true },
    workCenter: { type: String, required: true }
}, { _id: false });

const BoMSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Parent Product this BoM builds
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },

    components: [ComponentSchema],
    operations: [OperationSchema],

    previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoM' }
}, { timestamps: true });

module.exports = mongoose.model('BoM', BoMSchema);
