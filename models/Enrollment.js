const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
