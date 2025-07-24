// services/pessoaService.js
//const { supabase } = require('../supabase');
import { supabase } from '../supabase.js'; // ⬅️ importante: adicione `.js`

export async function criarPessoaCompleta({ pessoa, documentos, enderecos }) {

  if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

  //   if (erroTipo || !tipo) {
  //   return { error: erroTipo || 'Tipo não encontrado' };
  // }

  //Monta Pessoa Classe
  const DadPessoaData = {
    nome: pessoa.nome,
    id_tipo: pessoa.id_tipo //6 //tipo.id,
  };

  //Insere Pessoa
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(DadPessoaData)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };

  //Resgata Id da Pessoa
  const idPessoa = novaPessoa.id;

  //Grava Documento
  if (documentos?.cpf || documentos?.cnpj) {
    const docTable = documentos.cpf ? 'pessoa_fisica' : 'pessoa_juridica';
    //console.log('[DEBUG] documentos retornado:', documentos);
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
