const mongoose = require('mongoose');

const ECOSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['product', 'bom'], default: 'product' },

    // The master data target this ECO aims to modify
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    // What exactly is changing? Store as a JSON object (e.g. { price: 120 })
    changes: { type: mongoose.Schema.Types.Mixed, required: true },

    // ECO Pipeline State
    status: { type: String, enum: ['new', 'approval', 'done'], default: 'new' },

    // Determines if the ECO forces a new version creation or an in-place edit
    versionUpdate: { type: Boolean, default: true },

    // Audit Trail
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ECO', ECOSchema);
