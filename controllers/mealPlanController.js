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
// Obtener todos los MealPlans de un estudiante por su ID
exports.getMealPlansByStudentId = async (req, res) => {
    try {
        let studentId;

        if (req.user.roleName === 'Alumno') {
            // Si es estudiante, solo puede ver sus propios planes
            studentId = req.user.id;
        } else if (req.user.roleName === 'Instructor' || req.user.roleName === 'Admin') {
            // Instructores o admins pueden consultar cualquier estudiante
            studentId = req.params.id;
        } else {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        const mealPlans = await MealPlan.find({ student: studentId }).sort({ startDate: 1 });

        if (mealPlans.length === 0) {
            return res.status(404).json({ message: 'No se encontraron planes de alimentación para este estudiante.' });
        }

        res.status(200).json({ mealPlans });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes de alimentación.', error: error.message });
    }
};
// Actualizar el plan de alimentación de un estudiante (solo Instructores)
exports.updateMealPlanByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Solo instructores pueden actualizar el plan
        if (req.user.roleName !== 'Instructor') {
            return res.status(403).json({ message: 'Acceso denegado. Solo instructores pueden actualizar planes.' });
        }

        // Datos a actualizar
        const updateData = req.body;

        // Si se actualiza la fecha de inicio, recalcula la fecha de fin automáticamente
        if (updateData.startDate) {
            let newEndDate = new Date(updateData.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            updateData.endDate = newEndDate;
        }

        // Buscar y actualizar el último plan de ese estudiante
        const mealPlan = await MealPlan.findOneAndUpdate(
            { student: studentId }, // filtro
            updateData,
            { new: true, runValidators: true, sort: { startDate: -1 } } // opciones
        );

        if (!mealPlan) {
            return res.status(404).json({ message: 'No se encontró un plan de alimentación para este estudiante.' });
        }

        res.status(200).json({ message: 'Plan de alimentación actualizado', mealPlan });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan.', error: error.message });
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
// Eliminar todos los MealPlans de un estudiante (solo Instructores o Admins)
exports.deleteMealPlansByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Solo instructores o admins pueden eliminar planes de otros estudiantes
        if (req.user.roleName !== 'Instructor' && req.user.roleName !== 'Admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo instructores o administradores pueden eliminar planes.' });
        }

        const deleted = await MealPlan.deleteMany({ student: studentId });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: 'No se encontraron planes de alimentación para eliminar.' });
        }

        res.status(200).json({ message: `${deleted.deletedCount} plan(es) de alimentación eliminados.` });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar los planes.', error: error.message });
    }
};

