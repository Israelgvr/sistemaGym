const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({

   nombre: {
       type: String,
       trim: true,
       required : [true, 'Por favor ingrese su nombre completo'],
       maxlength: 32
   },
    apellidoPa: {
        type: String,
        trim: true,
        required : [true, 'Por favor ingrese su apellido completo'],
        maxlength: 32
    },
    apellidoMa: {
        type: String,
        trim: true,
        required : [true, 'Por favor ingrese su apellido completo'],
        maxlength: 32
    },

    sexo: {
        type: String,
        trim: true,
    },
    fechaNacimiento: {
        type: Date,
        required: [true, 'Por favor ingrese su Fecha de Nacimiento']
    },
    direccion: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },

   email: {
       type: String,
       trim: true,
       unique: true,
       match: [
           /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
           'Por favor, ingrese un correo válido'
       ]

   },

    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 6, // Adjust as needed
        select: false // Exclude password from query results by default
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    role: {
        type: Number,
        default: 0,

    },
    createdAt: { type: Date, default: Date.now }



}, {timestamps: true});




// cifrar la contraseña antes de guardar
userSchema.pre('save', async function(next){


    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});



// verifica la contarsena
userSchema.methods.comparePassword = async function(yourPassword){
    return await bcrypt.compare(yourPassword, this.password);
}

// obtine el token
userSchema.methods.jwtGenerateToken = function(){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: 3600
    });
}

// Campo virtual para calcular la edad
userSchema.virtual('edad').get(function () {
    const today = new Date();
    const birthDate = new Date(this.fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Habilitar el campo virtual en JSON y objetos
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Usuario", userSchema);