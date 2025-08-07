import express from 'express';
import { supabase } from '../supabase.js';
import { autenticar } from '../middleware/auth.js';
import { criarPessoaCompleta } from '../services/pessoaService.js'; // importa sua função

const router = express.Router();

// GET /pessoas — listar todas
router.get('/', autenticar, async (req, res) => {
  const { data, error } = await supabase.from('vw_pessoa').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// GET /pessoas/:id — obter uma pessoa
router.get('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vw_pessoa')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Pessoa não encontrada' });
  res.json(data);
});

// POST /pessoas — criar nova pessoa
router.post('/', async (req, res) => {
// router.post('/', autenticar, async (req, res) => {
  try {
    const dados = req.body;
    const idCriado = await criarPessoaCompleta(dados);

    if (!idCriado) {
      return res.status(500).json({ erro: 'Erro ao criar pessoa' });
    }

    return res.status(201).json({ sucesso: true, id: idCriado });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// PUT /pessoas/:id — atualizar pessoa existente
router.put('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  const { error } = await supabase
    .from('pessoa')
    .update(dados)
    .eq('id', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.json({ sucesso: true });
});

// DELETE /pessoas/:id — deletar pessoa
router.delete('/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('pessoa')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.json({ sucesso: true });
});

export default router;
