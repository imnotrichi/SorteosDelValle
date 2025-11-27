const cors = require('cors');
const { AppError } = require('../utils/appError.js');

const originsString = process.env.CORS_ORIGINS;
let allowedOrigins = [];

if (typeof originsString === 'string' && originsString.length > 0) {
    try {
        allowedOrigins = originsString.split(',');
    } catch (splitError) {
        allowedOrigins = [];
    }
} else {
    allowedOrigins = [];
}

const corsOptions = {
    origin: (origin, callback) => {
        const isAllowed = !origin || allowedOrigins.includes(origin);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback((new AppError('Este origen no está permitido por CORS.', 403)));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);