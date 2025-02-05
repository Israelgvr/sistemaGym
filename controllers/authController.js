const User = require('../models/user');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Función de login
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const user = await User.findOne({ correo }).populate('rol');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Se agrega el nombre del rol al token para efectos de autorización
        const payload = {
            id: user._id,
            correo: user.correo,
            roleName: user.rol ? user.rol.name : null
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Función para solicitar recuperación de contraseña (Forgot Password)
exports.forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const user = await User.findOne({ correo });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Generar token de reseteo (válido por 15 minutos)
        const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });

        // Construir la URL de reseteo (modifícala según tu dominio o lógica de la app)
        const resetUrl = `${resetToken}`;

        // Configurar las opciones del correo
        const mailOptions = {
            from: '"Soporte" <crm61096@gmail.com>',
            to: user.correo,
            subject: 'Recuperación de contraseña',
            text: `Utiliza el siguiente token para cambiar su contrasena: ${resetUrl}`,
            // Opcional: enviar también HTML
            // html: `<p>Utiliza el siguiente enlace para restablecer tu contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`
        };

        // Enviar el correo de recuperación
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            } else {
                // En un entorno de producción no se recomienda enviar el token en la respuesta
                return res.json({ message: 'Correo de recuperación enviado.' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Función para restablecer la contraseña
exports.resetPassword = async (req, res) => {
    try {
        // Se espera recibir en el body: { token: "token_de_reset", newPassword: "nueva_contraseña" }
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'El token y la nueva contraseña son requeridos.' });
        }

        // Verificar y decodificar el token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'El token ha expirado.' });
            }
            return res.status(400).json({ message: 'Token inválido.' });
        }

        // Buscar al usuario a través del id contenido en el token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Actualizar la contraseña del usuario (el modelo se encargará de encriptarla)
        user.password = newPassword;
        await user.save();

        // Enviar correo de confirmación de cambio de contraseña
        const mailOptions = {
            from: '"Soporte" <crm61096@gmail.com>',
            to: user.correo,
            subject: 'Confirmación de cambio de contraseña',
            text: 'Su contraseña ha sido actualizada correctamente.'
            // Opcional: también puedes enviar HTML
            // html: '<p>Su contraseña ha sido actualizada <strong>correctamente</strong>.</p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // Se registra el error, pero la respuesta ya se envió al cliente.
                console.error("Error al enviar el correo de confirmación:", error);
            } else {
                console.log("Correo de confirmación enviado:", info.response);
            }
        });

        return res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
