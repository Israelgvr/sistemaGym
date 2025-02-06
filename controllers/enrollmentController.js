const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Matricular a un alumno
exports.enrollStudent = async (req, res) => {
    try {
        const instructorId = req.user.id; // Obtenido del token JWT (middleware de autenticación)
        const { studentId } = req.body;

        // Verificar que el alumno exista y tenga rol "Alumno"
        const student = await User.findById(studentId).populate('rol');
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        if (!student.rol || student.rol.name !== 'Alumno') {
            return res.status(400).json({ message: 'El usuario seleccionado no es un alumno' });
        }

        // Verificar si el alumno ya está matriculado por este instructor
        const existingEnrollment = await Enrollment.findOne({ instructor: instructorId, student: studentId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'El alumno ya está matriculado' });
        }

        // Crear el registro de matrícula
        const enrollment = new Enrollment({
            instructor: instructorId,
            student: studentId
        });
        await enrollment.save();

        res.status(201).json({ message: 'Alumno matriculado correctamente', enrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar los alumnos matriculados por el instructor
exports.listEnrolledStudents = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // Buscar matrículas realizadas por este instructor y poblar datos del alumno
        const enrollments = await Enrollment.find({ instructor: instructorId }).populate({
            path: 'student',
            select: 'nombres apellidoPa apellidoMa correo'
        });

        res.json({ enrollments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
