
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola mundo desde Express!');
});

// Ruta de ejemplo con JSON
app.get('/api/data', (req, res) => {
  res.json({ message: 'Esta es una respuesta JSON', status: 'success' });
});

// Ruta POST de ejemplo
app.post('/api/data', (req, res) => {
  const body = req.body;
  res.json({ received: body });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
// index.js