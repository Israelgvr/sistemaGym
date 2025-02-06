const express = require('express');
const router = express.Router();
const { enrollStudent, listEnrolledStudents } = require('../controllers/enrollmentController');
const { isAuthenticated } = require('../middleware/auth');

// Middleware para verificar que el usuario autenticado sea Instructor
const isInstructor = (req, res, next) => {
    if (req.user.roleName !== 'Instructor') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol Instructor' });
    }
    next();
};

// Endpoint para matricular a un alumno (solo para instructores)
router.post('/enroll', isAuthenticated, isInstructor, enrollStudent);

// Endpoint para listar los alumnos matriculados (solo para instructores)
router.get('/enrollments', isAuthenticated, isInstructor, listEnrolledStudents);

module.exports = router;
