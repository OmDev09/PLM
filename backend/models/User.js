const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Engineer', 'Approver', 'Operations', 'Admin'],
        default: 'Engineer'
    }
});

module.exports = mongoose.model('User', UserSchema);
