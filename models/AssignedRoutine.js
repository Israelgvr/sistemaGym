const mongoose = require('mongoose');

const assignedRoutineSchema = new mongoose.Schema({
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoutineTemplate',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dia: {
        type: String,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        required: true
    },
    fechaAsignacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AssignedRoutine', assignedRoutineSchema);
