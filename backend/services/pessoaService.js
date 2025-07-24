import { supabase } from '../supabase.js'; // ⬅️ Certo com `.js`

export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos }) {
  try {
    console.log('[DEBUG] Iniciando criação de pessoa...');
    if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

    console.log('[DEBUG] Buscando tipo da pessoa...');
    const { data: tipo, error: erroTipo } = await supabase
      .from('tipo_pessoa')
      .select('id')
      .eq('descricao', pessoa.tipo_descricao)
      .single();

    if (erroTipo || !tipo) {
      console.log('[ERRO] Tipo:', erroTipo, tipo);
      return { error: erroTipo || 'Tipo não encontrado' };
    }

    console.log('[DEBUG] Inserindo pessoa...');
    const { data: novaPessoa, error: erroPessoa } = await supabase
      .from('pessoa')
      .insert({
        nome: pessoa.nome,
        id_tipo: tipo.id
      })
      .select()
      .single();

    if (erroPessoa || !novaPessoa) {
      console.log('[ERRO] Pessoa:', erroPessoa, novaPessoa);
      return { error: erroPessoa || 'Erro ao inserir pessoa' };
    }

    console.log('[DEBUG] Pessoa inserida com ID:', novaPessoa.id);
    const idPessoa = novaPessoa.id;

    // Inserir pessoa_fisica
    if (pesFisica?.cpf) {
      console.log('[DEBUG] Inserindo pessoa_fisica...');
      const { error: erroFisica } = await supabase
        .from('pessoa_fisica')
        .insert({
          id: idPessoa,
          cpf: pesFisica.cpf,
          numero_registro: pesFisica.numero_registro ?? null,
          orgao_expedidor: pesFisica.orgao_expedidor ?? null,
          data_expedicao: pesFisica.data_expedicao ?? null
        });

      if (erroFisica) {
        console.log('[ERRO] pessoa_fisica:', erroFisica);
        return { error: erroFisica };
      }
    }

    // Inserir pessoa_juridica
    if (pesJuridica?.cnpj) {
      console.log('[DEBUG] Inserindo pessoa_juridica...');
      const { error: erroJuridica } = await supabase
        .from('pessoa_juridica')
        .insert({
          id: idPessoa,
          cnpj: pesJuridica.cnpj,
          razao_social: pesJuridica.razao_social ?? null,
          inscricao_estadual: pesJuridica.inscricao_estadual ?? null,
          inscricao_municipal: pesJuridica.inscricao_municipal ?? null
        });

      if (erroJuridica) {
        console.log('[ERRO] pessoa_juridica:', erroJuridica);
        return { error: erroJuridica };
      }
    }

    // Inserir endereços
    if (Array.isArray(enderecos) && enderecos.length > 0) {
      console.log('[DEBUG] Inserindo enderecos...');
      const dadosEndereco = enderecos.map(e => ({ ...e, id_pessoa: idPessoa }));
      const { error: erroEndereco } = await supabase
        .from('pessoa_endereco')
        .insert(dadosEndereco);

      if (erroEndereco) {
        console.log('[ERRO] enderecos:', erroEndereco);
        return { error: erroEndereco };
      }
    }

    console.log('[SUCESSO] Cadastro completo:', novaPessoa);
    return { data: novaPessoa };

  } catch (e) {
    console.log('[ERRO EXCEÇÃO]', e);
    return { error: e.message || 'Erro inesperado' };
  }
}
