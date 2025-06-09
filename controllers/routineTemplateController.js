const RoutineTemplate = require('../models/RoutineTemplate');

// Crear una plantilla
exports.createTemplate = async (req, res) => {
    try {
        const { nombre, objetivo, nivel, tipoRutina, ejercicios, videoUrl } = req.body;

        const nuevaPlantilla = new RoutineTemplate({
            nombre,
            objetivo,
            nivel,
            tipoRutina,
            ejercicios,
            videoUrl,
            creador: req.user._id // asumimos que usas auth con req.user
        });

        await nuevaPlantilla.save();
        res.status(201).json(nuevaPlantilla);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la plantilla', error });
    }
};

// Obtener todas las plantillas del creador (instructor)
exports.getTemplates = async (req, res) => {
    try {
        const plantillas = await RoutineTemplate.find({ creador: req.user._id });
        res.json(plantillas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener plantillas', error });
    }
};

// Obtener una plantilla específica
exports.getTemplateById = async (req, res) => {
    try {
        const plantilla = await RoutineTemplate.findById(req.params.id);
        if (!plantilla) return res.status(404).json({ message: 'Plantilla no encontrada' });
        res.json(plantilla);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la plantilla', error });
    }
};

// Actualizar plantilla
exports.updateTemplate = async (req, res) => {
    try {
        const { nombre, objetivo, nivel, tipoRutina, ejercicios, videoUrl } = req.body;

        const plantillaActualizada = await RoutineTemplate.findByIdAndUpdate(
            req.params.id,
            { nombre, objetivo, nivel, tipoRutina, ejercicios, videoUrl },
            { new: true }
        );

        if (!plantillaActualizada) {
            return res.status(404).json({ message: 'Plantilla no encontrada' });
        }

        res.json(plantillaActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la plantilla', error });
    }
};

// Eliminar plantilla
exports.deleteTemplate = async (req, res) => {
    try {
        const result = await RoutineTemplate.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Plantilla no encontrada' });
        res.json({ message: 'Plantilla eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la plantilla', error });
    }
};
