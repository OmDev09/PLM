const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['ECO_CREATED', 'ECO_APPROVED', 'ECO_APPLIED', 'PRODUCT_CREATED', 'BOM_BASELINE_CREATED', 'ECO_DRAFTED'],
        required: true
    },

    // ID of the ECO or Product affected
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // For deep comparison and traceability
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },

    // Who performed the action
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
