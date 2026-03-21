const mongoose = require('mongoose');

const ECOSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['product', 'bom'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },

    // Dynamic State Machine Graph
    stage: { type: mongoose.Schema.Types.ObjectId, ref: 'EcoStage' },
    signatures: [{
        stage: { type: mongoose.Schema.Types.ObjectId, ref: 'EcoStage' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now }
    }],

    versionUpdate: { type: Boolean, default: true },
    status: { type: String, enum: ['Draft', 'Active', 'Completed'], default: 'Draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ECO', ECOSchema);
