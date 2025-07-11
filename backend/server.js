import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();  // <--- declare o app antes de usar

app.use(cors());        // <--- agora pode usar o cors

const PORT = process.env.PORT || 3000;

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint para listar clientes
app.get('/clientes', async (req, res) => {
  try {
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro real:', err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Teste de conexão com API SAP
app.get('/sap/business-partners', async (req, res) => {
  try {
    const response = await fetch('https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$top=5&$format=json', {
      headers: {
        'APIKey': process.env.SAP_API_KEY
      }
    });
    const data = await response.json();
    res.json(data.d.results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao acessar SAP' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://sandbox.api.sap.com:${PORT}`);
});

app.use(express.json()); // necessário para ler JSON no corpo da requisição

app.post('/clientes', async (req, res) => {
    const { nome, email } = req.body;
  
    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }
  
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ nome, email }])
        .select();  // 👈 isso resolve o erro do data[0]
  
      if (error) throw error;
  
      res.status(201).json(data[0]);
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
      res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
    }
  });

  app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
  
    try {
      console.log('Atualizando cliente id:', id, 'nome:', nome, 'email:', email);

      const { data, error } = await supabase
        .from('clientes')
        .update({ nome, email })
        .eq('id', id)
        .select();
  
      if (error) throw error;
  
      res.json(data[0]);
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  });

  app.delete('/clientes/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      console.log('Excluindo cliente id:', id);
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      res.status(204).send(); // sucesso sem conteúdo
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
  });  
  