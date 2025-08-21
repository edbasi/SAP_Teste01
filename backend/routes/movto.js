import express from 'express';
import { supabase } from '../supabase.js';
import { autenticar } from '../middleware/auth.js';

const router = express.Router();

// GET /movtos — listar todas
router.get('/', autenticar, async (req, res) => {
  const { data, error } = await supabase.from('vwmovto').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});



// GET /movtos/:id — obter uma movto
router.get('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vwmovto')
    .select('*')
    .eq('pi_id_movto', id)
    .single();

  if (error) return res.status(404).json({ erro: 'movto não encontrada' });
  res.json(data);
});

// POST - Criar nova movto completa
router.post('/', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_Movto_completo', payload);

  if (error) {
    console.error('Erro ao inserir movimentação completa:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
});

// PUT - Atualizar movto completa (reutiliza mesma função com idempotência do lado do SQL)
router.put('/:id', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_movto_completa', payload);

  if (error) {
    console.error('Erro ao atualizar movto completa:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
});


// DELETE /movtos/:id — deletar movto
router.delete('/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('movto')
    .delete()
    .eq('pi_id_movto', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.json({ sucesso: true });
});

export default router;
