// services/pessoaService.js
//const { supabase } = require('../supabase');
import { supabase } from '../supabase.js'; // ⬅️ importante: adicione `.js`

export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos }) {
  if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

  // Buscar id do tipo
  const { data: tipo, error: erroTipo } = await supabase
    .from('tipo_pessoa')
    .select('id')
    .eq('descricao', pessoa.tipo_descricao)
    .single();

  if (erroTipo || !tipo) return { error: erroTipo || 'Tipo não encontrado' };

  const PessoaData = {
    nome: pessoa.nome,
    id_tipo: tipo.id,
  };

  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(PessoaData)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };
  const idPessoa = novaPessoa.id;

  // Inserir pessoa_fisica
  if (pesFisica?.cpf) {
    const PessoaFis = {
      id: idPessoa,
      id_tipo: tipo.id,
      cpf: pesFisica.cpf,
      numero_registro: pesFisica.numero_registro,
      orgao_expedidor: pesFisica.orgao_expedidor,
      data_expedicao: pesFisica.data_expedicao,
    };

    const { error: erroDocFis } = await supabase
      .from('pessoa_fisica')
      .insert(PessoaFis);

    if (erroDocFis) return { error: erroDocFis };
  }

  // Inserir pessoa_juridica
  if (pesJuridica?.cnpj) {
    const PessoaJur = {
      id: idPessoa,
      id_tipo: tipo.id,
      cnpj: pesJuridica.cnpj,
      razao_social: pesJuridica.razao_social,
      inscricao_estadual: pesJuridica.inscricao_estadual,
      inscricao_municipal: pesJuridica.inscricao_municipal,
    };

    const { error: erroDocJur } = await supabase
      .from('pessoa_juridica')
      .insert(PessoaJur);

    if (erroDocJur) return { error: erroDocJur };
  }

  // Inserir endereços
  if (enderecos?.length > 0) {
    const dadosEndereco = enderecos.map(e => ({ ...e, id_pessoa: idPessoa }));
    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);

    if (erroEndereco) return { error: erroEndereco };
  }

  return { data: novaPessoa };
}
