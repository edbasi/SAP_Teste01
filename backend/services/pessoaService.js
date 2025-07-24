// services/pessoaService.js
//const { supabase } = require('../supabase');
import { supabase } from '../supabase.js'; // ⬅️ importante: adicione `.js`

export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos }) {

  if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

  //Resgaa id do tipo
  const { data: tipo, error: erroTipo } = await supabase
    .from('tipo_pessoa')
    .select('id')
    .eq('descricao', pessoa.tipo_descricao)
    .single();

  if (erroTipo || !tipo) {
    return { error: erroTipo || 'Tipo não encontrado' };
  }

  //Monta Pessoa Classe
  const PessoaData = {
    nome: pessoa.nome,
    id_tipo: tipo.id,
  };

  //Insere Pessoa
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(PessoaData)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };

  //Resgata Id da Pessoa
  const idPessoa = novaPessoa.id;

  //Grava Documento pesFisica
  if (pesFisica?.cpf) {

    // const PessoaFis = {
    //   nome: pessoa.nome,
    //   id_tipo: tipo.id,
    // };

    //console.log('[DEBUG] documentos retornado:', documentos);
    const { error: erroDoc } = await supabase.from('pessoa_fisica').insert({
      pesFisica,
      id: idPessoa, // ou id_pessoa: idPessoa dependendo do seu schema
    });
    if (erroDoc) return { error: erroDoc };
  }

  //Grava Documento pesJuridica
  if (pesJuridica?.cnpj) {
    //console.log('[DEBUG] documentos retornado:', documentos);
    const { error: erroDoc } = await supabase.from('pessoa_juridica').insert({
      ...pesJuridica,
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
