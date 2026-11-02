const express = require('express');

const mysql = require('mysql2');
const cors = require('cors'); 

const app = express();
const port = 3000;


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', 
  database: 'agrorganico', 
  port: 3306
});


db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('¡Conexión nativa exitosa a la base de datos de AgrOrgánico!');
});


app.post('/registro', (req, res) => {
  const { nombre, email, contrasena } = req.body;

  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const query = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
  
  db.query(query, [nombre, email, contrasena], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Hubo un error en el servidor al registrar.' });
    }
    res.status(201).json({ mensaje: '¡Usuario registrado con éxito en AgrOrgánico!' });
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor, rellene todos los campos.' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Hubo un error en el servidor al validar.' });
    }

    if (results.length > 0) {
      const usuario = results[0];
      return res.status(200).json({ 
        mensaje: '¡Inicio de sesión exitoso!',
        nombre: usuario.nombre 
      });
    } else {
      return res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
    }
  });
});


app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});