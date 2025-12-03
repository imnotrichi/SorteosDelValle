const jwt = require('jsonwebtoken')
const { AppError } = require('../utils/appError.js')

const validateJWT = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else {
         token = req.header('Authorization');
    }

    if (!token) {
        next(new AppError('No se proporcionó un token.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();

    } catch (error) {
        next(new AppError('El token no es válido.', 401));
    }
}

module.exports = validateJWT;