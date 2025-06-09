const express = require('express');
const router = express.Router();
const {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate
} = require('../controllers/routineTemplateController');

const { isAuthenticated, isAdmin,isAdminOrInstructor } = require('../middleware/auth');

// Crear plantilla de rutina (solo instructores o admin)
router.post('/routine-templates', isAuthenticated, createTemplate);

// Listar todas las plantillas del usuario autenticado
router.get('/routine-templates', isAuthenticated, getTemplates);

// Obtener una plantilla específica
router.get('/routine-templates/:id', isAuthenticated, getTemplateById);

// Actualizar plantilla (solo instructores o admin)
router.put('/routine-templates/:id', isAuthenticated, updateTemplate);

// Eliminar plantilla (solo instructores o admin)
router.delete('/routine-templates/:id', isAuthenticated, deleteTemplate);

module.exports = router;
