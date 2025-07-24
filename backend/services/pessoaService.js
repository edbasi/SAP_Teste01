import { supabase } from '../supabase.js'; // ⬅️ Certo com `.js`

export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos }) {
  if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

  // Buscar id do tipo_pessoa
  const { data: tipo, error: erroTipo } = await supabase
    .from('tipo_pessoa')
    .select('id')
    .eq('descricao', pessoa.tipo_descricao)
    .single();

  if (erroTipo || !tipo) return { error: erroTipo || 'Tipo não encontrado' };

  // Inserir na tabela pessoa
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert({
      nome: pessoa.nome,
      id_tipo: tipo.id
    })
    .select()
    .single();

  if (erroPessoa || !novaPessoa) return { error: erroPessoa || 'Erro ao inserir pessoa' };

  const idPessoa = novaPessoa.id;

  // Inserir na tabela pessoa_fisica, se aplicável
  if (pesFisica?.cpf) {
    const { error: erroFisica } = await supabase
      .from('pessoa_fisica')
      .insert({
        id: idPessoa, // FK obrigatória
        cpf: pesFisica.cpf,
        numero_registro: pesFisica.numero_registro ?? null,
        orgao_expedidor: pesFisica.orgao_expedidor ?? null,
        data_expedicao: pesFisica.data_expedicao ?? null
      });

    if (erroFisica) return { error: erroFisica };
  }

  // Inserir na tabela pessoa_juridica, se aplicável
  if (pesJuridica?.cnpj) {
    const { error: erroJuridica } = await supabase
      .from('pessoa_juridica')
      .insert({
        id: idPessoa, // FK obrigatória
        cnpj: pesJuridica.cnpj,
        razao_social: pesJuridica.razao_social ?? null,
        inscricao_estadual: pesJuridica.inscricao_estadual ?? null,
        inscricao_municipal: pesJuridica.inscricao_municipal ?? null
      });

    if (erroJuridica) return { error: erroJuridica };
  }

  // Inserir endereços, se houver
  if (Array.isArray(enderecos) && enderecos.length > 0) {
    const dadosEndereco = enderecos.map(e => ({
      ...e,
      id_pessoa: idPessoa
    }));

    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);

    if (erroEndereco) return { error: erroEndereco };
  }

  // Tudo ok
  return { data: novaPessoa };
}
