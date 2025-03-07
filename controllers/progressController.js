const Progress = require('../models/Progress');

// Crear un registro de progreso
exports.createProgress = async (req, res) => {
    try {
        const { weight, height, activityLevels, date, objectives, studentId } = req.body;
        let student;

        // Si el usuario es ALUMNO, se asigna su propio id.
        if (req.user.roleName === 'Alumno') {
            student = req.user.id;
        } else if (req.user.roleName === 'Instructor') {
            // Para el instructor es obligatorio enviar el id del alumno.
            if (!studentId) {
                return res.status(400).json({ message: 'El id del alumno es requerido' });
            }
            student = studentId;
        } else {
            return res.status(403).json({ message: 'No tiene permiso para agregar progreso' });
        }

        const progressData = new Progress({
            student,
            weight,
            height,
            activityLevels,
            date,
            objectives
        });
        await progressData.save();
        res.status(201).json({ message: 'Progreso creado', progress: progressData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar registros de progreso
exports.getProgress = async (req, res) => {
    try {
        let query = {};
        if (req.user.roleName === 'Alumno') {
            // Los alumnos solo ven su historial.
            query.student = req.user.id;
        } else if (req.user.roleName === 'Instructor') {
            // El instructor puede enviar un parámetro query (studentId) para filtrar.
            if (req.query.studentId) {
                query.student = req.query.studentId;
            }
        }
        const progressRecords = await Progress.find(query).sort({ date: 1 });
        res.json({ progress: progressRecords });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar registro de progreso
exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { weight, height, activityLevels, date, objectives } = req.body;

        let progressRecord = await Progress.findById(id);
        if (!progressRecord) {
            return res.status(404).json({ message: 'Registro de progreso no encontrado' });
        }

        // Los alumnos solo pueden actualizar sus propios registros.
        if (req.user.roleName === 'Alumno' && progressRecord.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tiene permiso para actualizar este registro' });
        }
        // El instructor puede actualizar registros (por ejemplo, de actualización semanal).

        if (weight !== undefined) progressRecord.weight = weight;
        if (height !== undefined) progressRecord.height = height;
        if (activityLevels !== undefined) progressRecord.activityLevels = activityLevels;
        if (date !== undefined) progressRecord.date = date;
        if (objectives !== undefined) progressRecord.objectives = objectives;

        // Recalcular IMC si cambian peso o altura.
        if (weight !== undefined || height !== undefined) {
            if (progressRecord.height > 0) {
                progressRecord.imc = progressRecord.weight / (progressRecord.height * progressRecord.height);
            } else {
                progressRecord.imc = 0;
            }
        }
        await progressRecord.save();
        res.json({ message: 'Progreso actualizado', progress: progressRecord });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un registro de progreso (solo Instructores)
exports.deleteProgress = async (req, res) => {
    try {
        if (req.user.roleName !== 'Instructor') {
            return res.status(403).json({ message: 'Solo los instructores pueden eliminar registros' });
        }
        const { id } = req.params;
        const deleted = await Progress.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Registro de progreso no encontrado' });
        }
        res.json({ message: 'Registro de progreso eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dashboard: Datos para gráfica de línea (ejemplo: evolución de peso e IMC en el tiempo)
exports.getLineChartData = async (req, res) => {
    try {
        let query = {};
        if (req.user.roleName === 'Alumno') {
            query.student = req.user.id;
        } else if (req.user.roleName === 'Instructor' && req.query.studentId) {
            query.student = req.query.studentId;
        }
        const records = await Progress.find(query).sort({ date: 1 });
        const data = records.map(record => ({
            date: record.date,
            weight: record.weight,
            imc: record.imc
        }));
        res.json({ lineChartData: data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dashboard: Datos para gráfica de torta (ejemplo: distribución de objetivos)
exports.getPieChartData = async (req, res) => {
    try {
        let query = {};
        if (req.user.roleName === 'Alumno') {
            query.student = req.user.id;
        } else if (req.user.roleName === 'Instructor' && req.query.studentId) {
            query.student = req.query.studentId;
        }
        const records = await Progress.find(query);
        const objectiveCount = {};
        records.forEach(record => {
            record.objectives.forEach(obj => {
                objectiveCount[obj] = (objectiveCount[obj] || 0) + 1;
            });
        });
        res.json({ pieChartData: objectiveCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
