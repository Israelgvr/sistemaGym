const mongoose = require('mongoose');

const ejercicioSchema = new mongoose.Schema({
    nombre: String,
    grupoMuscular: String,
    series: Number,
    repeticiones: Number,
    descansoSegundos: Number,
    videoUrl: String
});

const routineTemplateSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    objetivo: { type: String, required: true },
    nivel: { type: String, required: true },
    tipoRutina: { type: String, required: true },
    ejercicios: [ejercicioSchema],
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    videoUrl: String
});

module.exports = mongoose.model('RoutineTemplate', routineTemplateSchema);
