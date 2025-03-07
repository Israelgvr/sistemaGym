const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    activityLevels: {
        type: [String],
        default: []
    },
    date: {
        type: Date,
        required: true
    },
    objectives: {
        type: [String],
        default: []
    },
    imc: {
        type: Number
    }
}, { timestamps: true });

// Pre-save: calcular el IMC antes de guardar el registro.
ProgressSchema.pre('save', function(next) {
    if (this.height > 0) {
        this.imc = this.weight / (this.height * this.height);
    } else {
        this.imc = 0;
    }
    next();
});

module.exports = mongoose.model('Progress', ProgressSchema);
