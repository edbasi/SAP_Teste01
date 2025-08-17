import express from 'express';
import { supabase } from '../supabase.js';
import { autenticar } from '../middleware/auth.js';

const router = express.Router();

// GET /produtos — listar tods
router.get('/', autenticar, async (req, res) => {
  const { data, error } = await supabase.from('vwproduto').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});



// GET /produtos/:id — obter um produto
router.get('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vwproduto')
    .select('*')
    .eq('pi_id_produto', id)
    .single();

  if (error) return res.status(404).json({ erro: 'produto não encontrado' });
  res.json(data);
});

// POST - Criar novo produto completo
router.post('/', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_produto_completo', payload);

  if (error) {
    console.error('Erro ao inserir produto completo:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
});

// PUT - Atualizar produto completa (reutiliza mesma função com idempotência do lado do SQL)
router.put('/:id', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_produto_completa', payload);

  if (error) {
    console.error('Erro ao atualizar produto completa:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
});


// DELETE /produtos/:id — deletar produto
router.delete('/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('produto')
    .delete()
    .eq('pi_id_produto', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.json({ sucesso: true });
});

export default router;
