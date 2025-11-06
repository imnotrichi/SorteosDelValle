const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const sorteosRouter = require('./routes/sorteosRouter.js');

const { AppError, globalErrorHandler } = require('./utils/appError.js');

const app = express();

app.use(express.json());
app.use(morgan('combined'));

app.use('/api/sorteos', sorteosRouter);

app.use((req, res, next) => {
    const error = new AppError(`No se ha podido acceder a ${req.originalUrl} en el servidor`, 404);
    next(error);
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});