const AssignedRoutine = require('../models/AssignedRoutine');

// Crear asignación (solo instructor)
exports.assignRoutine = async (req, res) => {
    try {
        const { templateId, studentId, dia } = req.body;

        const nuevaAsignacion = new AssignedRoutine({
            template: templateId,
            student: studentId,
            dia
        });

        await nuevaAsignacion.save();
        res.status(201).json(nuevaAsignacion);
    } catch (err) {
        res.status(500).json({ message: 'Error al asignar rutina', error: err });
    }
};

// Ver rutinas asignadas a un estudiante autenticado
exports.getMyRoutinesByDay = async (req, res) => {
    try {
        const rutinas = await AssignedRoutine.find({ student: req.user._id })
            .populate('template')
            .sort({ dia: 1 });

        res.json(rutinas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener rutinas', error: err });
    }
};

// Actualizar asignación
exports.updateAssignment = async (req, res) => {
    try {
        const updated = await AssignedRoutine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'No encontrado' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar', error: err });
    }
};

// Eliminar asignación
exports.deleteAssignment = async (req, res) => {
    try {
        const deleted = await AssignedRoutine.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'Asignación eliminada' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar', error: err });
    }
};
