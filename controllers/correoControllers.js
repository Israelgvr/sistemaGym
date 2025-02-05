const Email = require('../models/correos');
const transporter = require("../config/mailer");


exports.sendEmail = async (req, res) => {
    try {
        const { to, subject,estudiante } = req.body;

        // Crear el objeto de correo
        const email = new Email({ to, subject,estudiante });

        // Guardar el correo en la base de datos
        await email.save();
        // Estructura HTML del correo con un banner de publicidad
        const htmlMessage = `
           <html>
<head>
    <style>
        /* Estilos CSS para el banner de publicidad */
        .banner {
            width: 100%;
            height: auto;
            display: block;
            margin-bottom: 20px;
        }
        .center {
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>¡SISTEMA API REST!</h1>
    <h4>DEMO:</h4>

   </body>
</html>

        `;

        // Enviar el correo con estructura HTML
        await transporter.sendMail({
            from: 'crm61096@gmail.com',
            to,
            subject,
            html: htmlMessage,
        });

        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
    }
};
exports.listAllEmails = async (req, res) => {
    try {
        // Obtener todos los correos de la base de datos
        const emails = await Email.find().populate('estudiante', '-__v');

        // Verificar si no se encontraron correos
        if (!emails || emails.length === 0) {
            return res.status(404).json({ message: 'No se encontraron correos.' });
        }

        // Devolver los correos con todos los datos del estudiante
        res.status(200).json({ emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al obtener los correos.' });
    }
};