const MealPlan = require('../models/MealPlan');

// Crear un nuevo plan de alimentación (solo Instructores)
exports.createMealPlan = async (req, res) => {
    try {
        // Solo los instructores pueden crear planes de alimentación
        if (req.user.roleName !== 'Instructor') {
            return res.status(403).json({ message: 'Acceso denegado. Solo instructores pueden crear planes de alimentación.' });
        }

        const {
            studentId,       // ID del alumno para quien se crea el plan
            startDate,
            breakfast,
            breakfastReminderTime,
            snackMorning,
            lunch,
            lunchReminderTime,
            snackAfternoon,
            dinner,
            dinnerReminderTime,
            hydration,       // { recommendedLiters: Number, reminderTime: String }
            recommendations,
            supplementRecommendations
        } = req.body;

        // Verificar que se haya enviado el id del alumno
        if (!studentId) {
            return res.status(400).json({ message: 'El ID del alumno es requerido.' });
        }

        // Se crea el plan. La fecha de término se calcula automáticamente en el modelo.
        const mealPlan = new MealPlan({
            instructor: req.user.id,
            student: studentId,
            startDate,
            breakfast,
            breakfastReminderTime,
            snackMorning,
            lunch,
            lunchReminderTime,
            snackAfternoon,
            dinner,
            dinnerReminderTime,
            hydration,
            recommendations,
            supplementRecommendations
        });

        await mealPlan.save();
        res.status(201).json({ message: 'Plan de alimentación creado', mealPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar planes de alimentación
// Los instructores pueden ver los planes de sus alumnos; los alumnos ven sus propios planes.
exports.getMealPlans = async (req, res) => {
    try {
        let query = {};

        if (req.user.roleName === 'Alumno') {
            // El alumno ve únicamente sus planes
            query.student = req.user.id;
        } else if (req.user.roleName === 'Instructor') {
            // El instructor puede enviar opcionalmente ?studentId= para filtrar los planes de un alumno en específico
            if (req.query.studentId) {
                query.student = req.query.studentId;
            } else {
                // También podría filtrar por los planes creados por él
                query.instructor = req.user.id;
            }
        }

        const mealPlans = await MealPlan.find(query).sort({ startDate: 1 });
        res.json({ mealPlans });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un plan de alimentación (solo Instructores)
exports.updateMealPlan = async (req, res) => {
    try {
        // Solo instructores pueden actualizar el plan
        if (req.user.roleName !== 'Instructor') {
            return res.status(403).json({ message: 'Acceso denegado. Solo instructores pueden actualizar planes.' });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Si se actualiza startDate, recalcular endDate (un mes después)
        if (updateData.startDate) {
            let newEndDate = new Date(updateData.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            updateData.endDate = newEndDate;
        }

        const mealPlan = await MealPlan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!mealPlan) {
            return res.status(404).json({ message: 'Plan de alimentación no encontrado' });
        }
        res.json({ message: 'Plan de alimentación actualizado', mealPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un plan de alimentación (solo Instructores)
exports.deleteMealPlan = async (req, res) => {
    try {
        // Solo instructores pueden eliminar planes
        if (req.user.roleName !== 'Instructor') {
            return res.status(403).json({ message: 'Acceso denegado. Solo instructores pueden eliminar planes.' });
        }

        const { id } = req.params;
        const deleted = await MealPlan.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Plan de alimentación no encontrado' });
        }
        res.json({ message: 'Plan de alimentación eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
