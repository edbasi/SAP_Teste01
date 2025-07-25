export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos }) {
  console.log('========== INÍCIO CRIAÇÃO DE PESSOA ==========');

  return { error: 'Nome da pessoa é obrigatório' };
  try {
    // 🔎 Log de entrada
    console.log('[INPUT] Pessoa:', pessoa);
    //console.log('[INPUT] Tipo:', tipo);
    if (!pessoa?.nome) return { error: 'Nome da pessoa é obrigatório' };

    if (!pessoa?.tipo_descricao) return { error: 'Descrição do tipo é obrigatória' };
    
    console.log('[DEBUG] Buscando tipo da pessoa...');
    const { data: tipo, error: erroTipo } = await supabase
      .from('tipo_pessoa')
      .select('id')
      .eq('descricao', pessoa.tipo)
      .single();

    if (erroTipo || !tipo) {
      console.log('[ERRO] Tipo:', erroTipo, tipo);
      return { error: erroTipo || 'Tipo não encontrado' };
    }

    const idTipo = tipo.id;

    // 1. Inserir pessoa
    console.log('[DEBUG] Inserindo pessoa...');
    const { data: novaPessoa, error: erroPessoa } = await supabase
      .from('pessoa')
      .insert({
        nome: pessoa.nome,
        id_tipo: idTipo
      })
      .select()
      .single();

    if (erroPessoa) throw { origem: 'pessoa', mensagem: 'Erro ao inserir pessoa', detalhes: erroPessoa };

    const idPessoa = novaPessoa.id;
    console.log('[OK] Pessoa inserida:', idPessoa);

    // 2. Inserir pessoa_fisica
    if (pesFisica) {
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

      if (erroFisica) throw { origem: 'pessoa_fisica', mensagem: 'Erro ao inserir pessoa_fisica', detalhes: erroFisica };
      console.log('[OK] Pessoa física inserida.');
    }

    // // 3. Inserir pessoa_juridica
    if (pesJuridica) {
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

      if (erroJuridica) throw { origem: 'pessoa_juridica', mensagem: 'Erro ao inserir pessoa_juridica', detalhes: erroJuridica };
      console.log('[OK] Pessoa jurídica inserida.');
    }

    // // 4. Inserir endereços
    if (enderecos?.length > 0) {
      console.log('[DEBUG] Inserindo endereços...');
      const dadosEndereco = enderecos.map(e => ({
        ...e,
        id_pessoa: idPessoa
      }));

      const { error: erroEndereco } = await supabase
        .from('pessoa_endereco')
        .insert(dadosEndereco);

      if (erroEndereco) throw { origem: 'pessoa_endereco', mensagem: 'Erro ao inserir endereços', detalhes: erroEndereco };
      console.log('[OK] Endereços inseridos.');
    }

    console.log('========== FIM CRIAÇÃO DE PESSOA ==========');
    return { idPessoa, success: true };

  } catch (erro) {
    console.error('[FALHA]', erro);

    // 📝 Registrar erro no banco
    await supabase.from('log_erro').insert({
      origem: erro.origem ?? 'desconhecido',
      mensagem: erro.mensagem ?? 'Erro desconhecido',
      detalhes: erro.detalhes ?? {}
    });

    return { error: erro };
   }
}
