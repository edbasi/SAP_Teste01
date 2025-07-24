// services/pessoaService.js
//const { supabase } = require('../supabase');
import { supabase } from '../supabase.js'; // ⬅️ importante: adicione `.js`

export async function criarPessoaCompleta({ pessoa, documentos, enderecos }) {

  //Classe
  const { data: tipo, error: erroTipo } = await supabase
    .from('Tipo')
    .select('id')
    .eq('descricao', pessoa.tipo_descricao)
    .single();

  if (erroTipo) return res.status(400).json({ erro: 'Tipo Cliente não encontrado' });
  
  // Substituir tipo_descricao por id_tipo no objeto a ser salvo
const novaPessoaData = {
  nome: pessoa.nome,
  id_tipo: tipo.id
};

  //Pessoa
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(pessoa)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };

  const idPessoa = novaPessoa.id;

  // Documento
  if (documentos?.cpf || documentos?.cnpj) {
    const docTable = documentos.cpf ? 'pessoa_fisica' : 'pessoa_juridica';
    const { error: erroDoc } = await supabase.from(docTable).insert({
      ...documentos,
      id: idPessoa,
    });
    if (erroDoc) return { error: erroDoc };
  }

  // Endereços
  if (enderecos?.length > 0) {
    const dadosEndereco = enderecos.map(e => ({ ...e, id_pessoa: idPessoa }));
    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);
    if (erroEndereco) return { error: erroEndereco };
  }

  return { data: novaPessoa };
}

// module.exports = {
//   criarPessoaCompleta
// };


