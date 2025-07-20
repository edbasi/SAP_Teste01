import express from 'express';
import dotenv from 'dotenv';
import clienteRoutes from './routes/cliente.js';
import fornecedorRoutes from './routes/fornecedor.js';
import operadorRoutes from './routes/operador.js';
import bancoRoutes from './routes/banco.js';
import limpezaRoutes from './routes/limpeza.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/clientes', clienteRoutes);
app.use('/fornecedores', fornecedorRoutes);
app.use('/operadores', operadorRoutes);
app.use('/bancos', bancoRoutes);
app.use('/limpezas', limpezaRoutes);

app.get('/', (_, res) => res.send('API rodando...'));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
