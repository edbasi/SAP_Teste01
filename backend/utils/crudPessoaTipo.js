// utils/crudPessoaTipo.js
const createCrudPessoaTipo = ({ tipoDescricao, indiceTipo }) => {
    const express = require('express');
    const router = express.Router();
    const { supabase } = require('../supabaseClient');
  
    // GET all
    router.get('/', async (req, res) => {
      const { data, error } = await supabase
        .from('pessoa_view_completa')
        .select('*')
        .eq('descricao', tipoDescricao)
        .eq('ativo', true);
      if (error) return res.status(500).json({ erro: error.message });
      res.json(data);
    });
  
    // GET by ID
    router.get('/:id', async (req, res) => {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('pessoa_view_completa')
        .select('*')
        .eq('id', id)
        .eq('descricao', tipoDescricao)
        .single();
      if (error) return res.status(404).json({ erro: error.message });
      res.json(data);
    });
  
    // POST
    router.post('/', async (req, res) => {
      const { nome, id_banco, dadosExtras } = req.body;
  
      const { data: pessoa, error: erroPessoa } = await supabase
        .from('pessoa')
        .insert({ nome, id_tipo: indiceTipo })
        .select()
        .single();
      if (erroPessoa) return res.status(500).json({ erro: erroPessoa.message });
  
      if (id_banco) {
        await supabase
          .from('pessoa_db')
          .insert({ id_pessoa: pessoa.id, id_banco, ativo: true });
      }
  
      // Outras tabelas opcionais: documentos, endereço, etc.
      // Se quiser inserir automaticamente, pode ser feito aqui com os dadosExtras
  
      res.status(201).json(pessoa);
    });
  
    // PUT
    router.put('/:id', async (req, res) => {
      const { id } = req.params;
      const { nome, id_banco } = req.body;
  
      const { error } = await supabase
        .from('pessoa')
        .update({ nome })
        .eq('id', id);
      if (error) return res.status(500).json({ erro: error.message });
  
      if (id_banco) {
        await supabase
          .from('pessoa_db')
          .upsert({ id_pessoa: id, id_banco, ativo: true }, { onConflict: ['id_pessoa', 'id_banco'] });
      }
  
      res.json({ mensagem: 'Atualizado com sucesso' });
    });
  
    // DELETE lógico: desativa relação com banco
    router.delete('/:id', async (req, res) => {
      const { id } = req.params;
  
      const { error } = await supabase
        .from('pessoa_db')
        .update({ ativo: false })
        .eq('id_pessoa', id);
  
      if (error) return res.status(500).json({ erro: error.message });
      res.json({ mensagem: 'Relacionamento com banco desativado' });
    });
  
    return router;
  };
  
  module.exports = { createCrudPessoaTipo };
  