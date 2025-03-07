const express = require('express');
const router = express.Router();
const {
    createMealPlan,
    getMealPlans,
    updateMealPlan,
    deleteMealPlan
} = require('../controllers/mealPlanController');
const { isAuthenticated } = require('../middleware/auth');

// Crear plan de alimentación (solo Instructores)
router.post('/mealplans', isAuthenticated, createMealPlan);

// Listar planes de alimentación
router.get('/mealplans', isAuthenticated, getMealPlans);

// Actualizar plan de alimentación (solo Instructores)
router.put('/mealplans/:id', isAuthenticated, updateMealPlan);

// Eliminar plan de alimentación (solo Instructores)
router.delete('/mealplans/:id', isAuthenticated, deleteMealPlan);

module.exports = router;
