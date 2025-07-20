const express = require('express');
const app = express();
app.use(express.json());

app.use('/clientes', require('./routes/cliente'));
app.use('/fornecedores', require('./routes/fornecedor'));
app.use('/operadores', require('./routes/operador'));
app.use('/bancos', require('./routes/banco'));
app.use('/limpeza', require('./routes/limpeza'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
