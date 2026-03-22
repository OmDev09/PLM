const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: [
            'ECO_DRAFTED',
            'ECO_CREATED',
            'ECO_STAGE_TRANSITION',
            'ECO_APPROVAL_ACTION',
            'ECO_SIGN_ACTION',
            'ECO_APPROVED',
            'ECO_APPLIED',
            'PRODUCT_CREATED',
            'PRODUCT_VERSIONED',
            'BOM_BASELINE_CREATED',
            'BOM_VERSIONED'
        ],
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
