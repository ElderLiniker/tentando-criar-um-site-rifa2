require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Senha do administrador, protegida no backend
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Rota para autenticação do administrador
app.post('/admin/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.status(200).send({ success: true, message: 'Autenticação bem-sucedida!' });
    } else {
        res.status(401).send({ success: false, message: 'Senha incorreta!' });
    }
});

// Inicializar o servidor
app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
