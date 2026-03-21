const mongoose = require('mongoose');

const EcoStageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sequence: { type: Number, required: true },
    isFinal: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false },
    approvals: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['required', 'optional'], default: 'required' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('EcoStage', EcoStageSchema);
