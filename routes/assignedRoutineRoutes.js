const express = require('express');
const router = express.Router();
const {
    assignRoutine,
    getMyRoutinesByDay,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignedRoutineController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Instructores: Asignar rutina a estudiante
router.post('/assigned-routines', isAuthenticated, assignRoutine);

// Estudiante: Ver mis rutinas por día
router.get('/my-routines', isAuthenticated, getMyRoutinesByDay);

// Instructores: Actualizar o eliminar una asignación
router.put('/assigned-routines/:id', isAuthenticated, updateAssignment);
router.delete('/assigned-routines/:id', isAuthenticated, deleteAssignment);

module.exports = router;
