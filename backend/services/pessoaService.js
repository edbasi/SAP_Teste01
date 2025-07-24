// services/pessoaService.js
//const { supabase } = require('../supabase');
import { supabase } from '../supabase.js'; // ⬅️ importante: adicione `.js`

export async function criarPessoaCompleta({ pessoa, documentos, enderecos }) {

  console.log('[DEBUG] Iniciando criarPessoaCompleta');
  console.log('[DEBUG] pessoa:', pessoa);
  console.log('[DEBUG] documentos:', documentos);
  console.log('[DEBUG] enderecos:', enderecos);

  if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

  //Resgaa id do tipo
  const { data: tipo, error: erroTipo } = await supabase
    .from('tipo')
    .select('id')
    .eq('descricao', pessoa.tipo_descricao)
    .single();

    console.log('[DEBUG] tipo retornado:', tipo);
    console.log('[DEBUG] erroTipo:', erroTipo);

    if (erroTipo || !tipo) {
    return { error: erroTipo || 'Tipo não encontrado' };
  }

  //Monta Pessoa Classe
  const novaPessoaData = {
    nome: pessoa.nome,
    id_tipo: tipo.id,
  };

  //Insere Pessoa
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(novaPessoaData)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };

  //Resgata Id da Pessoa
  const idPessoa = novaPessoa.id;

  //Grava Documento
  if (documentos?.cpf || documentos?.cnpj) {
    const docTable = documentos.cpf ? 'pessoa_fisica' : 'pessoa_juridica';
    console.log('[DEBUG] documentos retornado:', documentos);
    const { error: erroDoc } = await supabase.from(docTable).insert({
      ...documentos,
      id: idPessoa, // ou id_pessoa: idPessoa dependendo do seu schema
    });
    if (erroDoc) return { error: erroDoc };
  }

  //Grava Endereco
  if (enderecos?.length > 0) {
    const dadosEndereco = enderecos.map(e => ({ ...e, id_pessoa: idPessoa }));
    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);
    if (erroEndereco) return { error: erroEndereco };
  }

  return { data: novaPessoa };
}
