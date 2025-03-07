const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
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
    startDate: {
        type: Date,
        required: true
    },
    // La fecha de término se calcula a partir de la fecha de inicio (un mes después)
    endDate: {
        type: Date,
        required: true
    },
    // Desayuno: arreglo de 3 opciones obligatorias
    breakfast: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length === 3;
            },
            message: props => `Desayuno debe tener exactamente 3 opciones`
        }
    },
    // Hora del recordatorio para desayuno (por ejemplo, "08:00")
    breakfastReminderTime: {
        type: String,
        required: true
    },
    // Merienda de la mañana (opcional)
    snackMorning: {
        type: [String],
        default: []
    },
    // Almuerzo: arreglo de 3 opciones obligatorias
    lunch: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length === 3;
            },
            message: props => `Almuerzo debe tener exactamente 3 opciones`
        }
    },
    lunchReminderTime: {
        type: String,
        required: true
    },
    // Merienda de la tarde (opcional)
    snackAfternoon: {
        type: [String],
        default: []
    },
    // Cena: arreglo de 3 opciones obligatorias
    dinner: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length === 3;
            },
            message: props => `Cena debe tener exactamente 3 opciones`
        }
    },
    dinnerReminderTime: {
        type: String,
        required: true
    },
    // Hidratación: se registra la cantidad de litros recomendados y la hora del recordatorio
    hydration: {
        recommendedLiters: {
            type: Number,
            required: true
        },
        reminderTime: {
            type: String,
            required: true
        }
    },
    // Recomendaciones de alimentación (obligatorio)
    recommendations: {
        type: String,
        required: true
    },
    // Recomendaciones de suplementación deportiva (opcional)
    supplementRecommendations: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Pre-save: si no se envía "endDate", se calcula como un mes después de startDate
MealPlanSchema.pre('validate', function(next) {
    if (this.startDate && !this.endDate) {
        let end = new Date(this.startDate);
        end.setMonth(end.getMonth() + 1);
        this.endDate = end;
    }
    next();
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
