const express = require('express');
const router = express.Router();
const {
    createMealPlan,
    getMealPlans,
    updateMealPlan,
    deleteMealPlan,
    getMealPlansByStudentId,
    updateMealPlanByStudentId,
    deleteMealPlansByStudentId

} = require('../controllers/mealPlanController');
const { isAuthenticated } = require('../middleware/auth');

// Crear plan de alimentación (solo Instructores)
router.post('/mealplans', isAuthenticated, createMealPlan);

// Listar planes de alimentación
router.get('/mealplans', isAuthenticated, getMealPlans);

router.get('/mealplans/:id', isAuthenticated, getMealPlansByStudentId);


router.put('/mealplans/:id', isAuthenticated, updateMealPlan);
// PUT: Actualizar plan de un estudiante por su ID
router.put('/mealplans/:studentId',isAuthenticated, updateMealPlanByStudentId);


// Eliminar plan de alimentación (solo Instructores)
router.delete('/mealplans/:studentId', isAuthenticated,deleteMealPlansByStudentId);

module.exports = router;
