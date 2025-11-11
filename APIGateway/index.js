const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

const sorteosServiceUrl = process.env.SORTEOS_SERVICE_URL;
const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL;

if (sorteosServiceUrl) {
  app.use('/api/sorteos', proxy(sorteosServiceUrl));
  console.log(`Proxy activado para /api/sorteos -> ${sorteosServiceUrl}`);
}

if (usuariosServiceUrl) {
  app.use('/api/usuarios', proxy(usuariosServiceUrl));
  console.log(`Proxy activado para /api/usuarios -> ${usuariosServiceUrl}`);
}

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el API Gateway' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway corriendo en el puerto ${PORT}`);
});