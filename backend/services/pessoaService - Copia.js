export async function criarPessoaCompleta({ r_pessoa, a_contatos, a_enderecos }) {
  console.log('========== INÍCIO CRIAÇÃO DE PESSOA ==========');

  // ✅ Verifica se o objeto r_pessoa foi informado
  if (!r_pessoa) return { error: 'Dados Inválidos' }; // ⛔ Retorna erro se estiver ausente

  try {
    // 🔍 Loga os dados recebidos
    console.log('[INPUT] Pessoa:', r_pessoa);

    // ✅ Valida campos obrigatórios
    if (!r_pessoa.s_Nome) return { error: 'Nome da pessoa é obrigatório' };    // ⛔ Campo obrigatório: s_Nome
    if (!r_pessoa.s_Classe) return { error: 'Descrição do tipo é obrigatória' }; // ⛔ Campo obrigatório: s_Classe

    // 🔍 Busca o tipo da pessoa na tabela 'TabPesClasse' com base na descrição recebida (s_Classe)
    console.log('[DEBUG] Buscando tipo da Pessoa...');

    const { data: r_tipo, error: erroTipo } = await supabase
      .from('TabPesClasse')
      .select('id, TipClasse') // Campos necessários
      .eq('DesClasse', r_pessoa.s_Classe) // Filtro pela descrição da classe
      .single(); // Espera exatamente um resultado

    // ❌ Se não encontrou o tipo ou houve erro na consulta
    if (erroTipo || !r_tipo) {
      console.log('[ERRO] Tipo:', erroTipo, r_tipo);
      return { error: erroTipo?.message || 'Tipo não encontrado' };
    }

    // ✅ Extrai os campos necessários do resultado
    const i_Tipo = r_tipo.id;
    const s_Tipo = r_tipo.TipClasse;

    // 1. Grava Dados da pessoa na tabela 'CadPessoa'
    console.log('[DEBUG] Inserindo Pessoa...');

    const { data: r_sucesso, error: r_erro } = await supabase
      .from('CadPessoa')
      .upsert(
        {
          id: r_pessoa.i_Pessoa,             // ✅ ID existente: atualiza / ID novo: insere
          NomPessoa: r_pessoa.s_Nome,
          idClassePessoa: i_Tipo,
          TipClasse: s_Tipo
        },
        { onConflict: 'id' }                // 🔑 'id' deve ser o nome exato da coluna única
      )
      .select()
      .single();

    // ❌ Se ocorrer erro na inserção
    if (r_erro) {
      throw {
        origem: 'pessoa',
        mensagem: 'Erro ao inserir pessoa',
        detalhes: r_erro
      };
    }

    // ✅ Recupera o ID da nova pessoa inserida
    const i_Pessoa = r_sucesso.id;

    // ✅ Loga sucesso com os dados inseridos
    console.log('[OK] Pessoa inserida:', r_sucesso);

    // 2. Registrar erro no banco
    await supabase.from('log_erro').insert({
      origem: erro.origem ?? 'desconhecido',
      mensagem: erro.mensagem ?? 'Erro desconhecido',
      detalhes: erro.detalhes ?? {}
    });

    // 3. Grava Dados da Pessoa Física
    if (r_pessoa.s_CpfPessoa){
      console.log('[DEBUG] Inserindo Pessoa Física...');

       // 3.1. Grava Dados da pessoa na tabela 'CadCpfPessoa'
      const { data: r_sucesso, error: r_erro } = await supabase
        .from('CadCpfPessoa')
        .upsert(
          {
            idPessoa: i_Pessoa,
            CpfPessoa: r_pessoa.s_CpfPessoa,
            NumRegistro: r_pessoa.s_NumRegistro ?? null,
            OrgExpedidor: r_pessoa.s_OrgRegistro ?? null,
            DatExpedicao: r_pessoa.d_ExpRegistro ?? null
          },
          { onConflict: 'idPessoa' }  // ⚠️ 'idPessoa' deve ser único na tabela
        )
        .select()
        .single();

      if (r_erro) throw { origem: 'Pessoa Física',
        mensagem: 'Erro ao inserir/atualizar Pessoa Física',
        detalhes: r_erro };

      console.log('[OK] Pessoa Física inserida ou atualizada.');

      // 3.1. Exclui Dados da pessoa da tabela 'CadCgcPessoa'
      const { error: r_erro } = await supabase
        .from('CadCgcPessoa')
        .delete()
        .eq('idPessoa', i_Pessoa);

      if (r_erro) {
        console.warn('[AVISO] Não foi possível remover CNPJ vinculado:',
        detalhes: r_erro };
      } else {
        console.log('[OK] CNPJ vinculado removido com sucesso (se existia).');
      }

    }

    // 4. Grava Dados da Pessoa Jurídica
    if (r_pessoa.s_CgcPessoa){
      console.log('[DEBUG] Inserindo Pessoa Jurídica...');

       // 4.1. Grava Dados da pessoa na tabela 'CadCgcPessoa'
      const { data: r_sucesso, error: r_erro } = await supabase
        .from('CadCgcPessoa')
        .upsert(
          {
            idPessoa: i_Pessoa,
            CgcPessoa: r_pessoa.s_CgcPessoa,
            InscEstadual: r_pessoa.s_InscEstadual ?? null,
            InscMunicipal: r_pessoa.s_InscMunicipal ?? null,
            RazSocial: r_pessoa.s_RazSocial ?? r_pessoa.s_Nome
          },
          { onConflict: 'idPessoa' }  // ⚠️ 'idPessoa' deve ser único na tabela
        )
        .select()
        .single();

      if (r_erro) throw { origem: 'Pessoa Jurídica',
        mensagem: 'Erro ao inserir/atualizar Pessoa Jurídica',
        detalhes: r_erro };

      console.log('[OK] Pessoa Jurídica inserida ou atualizada.');

      // 4.1. Exclui Dados da pessoa da tabela 'CadCgcPessoa'
      const { error: r_erro } = await supabase
        .from('CadCpfPessoa')
        .delete()
        .eq('idPessoa', i_Pessoa);

      if (r_erro) {
        console.warn('[AVISO] Não foi possível remover CPF vinculado:',
        detalhes: r_erro };
      } else {
        console.log('[OK] CPF vinculado removido com sucesso (se existia).');
      }

    }

  //   // // 5. Inserir endereços
  //   if (enderecos?.length > 0) {
  //     console.log('[DEBUG] Inserindo endereços...');
  //     const dadosEndereco = enderecos.map(e => ({
  //       ...e,
  //       id_pessoa: idPessoa
  //     }));

  //     const { error: erroEndereco } = await supabase
  //       .from('pessoa_endereco')
  //       .insert(dadosEndereco);

  //     if (erroEndereco) throw { origem: 'pessoa_endereco', mensagem: 'Erro ao inserir endereços', detalhes: erroEndereco };
  //     console.log('[OK] Endereços inseridos.');
  //   }

  //   console.log('========== FIM CRIAÇÃO DE PESSOA ==========');
  //   return { idPessoa, success: true };

  // } catch (erro) {
  //   console.error('[FALHA]', erro);

    return { error: erro };
   }
}
