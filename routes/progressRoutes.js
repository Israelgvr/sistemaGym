const express = require('express');
const router = express.Router();
const {
    createProgress,
    getProgress,
    updateProgress,
    deleteProgress,
    getLineChartData,
    getPieChartData
} = require('../controllers/progressController');
const { isAuthenticated } = require('../middleware/auth');

// Crear registro de progreso
router.post('/progress', isAuthenticated, createProgress);

// Listar registros de progreso
router.get('/progress', isAuthenticated, getProgress);

// Actualizar un registro (por su id)
router.put('/progress/:id', isAuthenticated, updateProgress);

// Eliminar un registro (solo instructor)
router.delete('/progress/:id', isAuthenticated, deleteProgress);

// Endpoints para datos de Dashboard
router.get('/progress/dashboard/line', isAuthenticated, getLineChartData);
router.get('/progress/dashboard/pie', isAuthenticated, getPieChartData);

module.exports = router;
