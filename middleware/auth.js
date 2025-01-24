const jwt = require('jsonwebtoken');
const User = require("../models/user");
const ErrorResponse = require('../utils/errorResponse');


// verfiva si el usuario esta autentificado
exports.isAuthenticated = async (req, res, next) =>{

    const {token} = req.cookies;

    // el token de inicio de sesion debe existir
    if (!token){
        return next (new ErrorResponse('Debes iniciar sesión para acceder.', 401));
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();

    } catch (error) {
        return next (new ErrorResponse('Debes iniciar sesión para acceder', 401));
    }
}

// admin middleware
exports.isAdmin = (req, res, next) =>{
    if (req.user.role === 1){
        return next (new ErrorResponse('Acceso denegado, debes ser administrador', 401));
    }
    next();

}
