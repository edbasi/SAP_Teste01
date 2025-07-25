export async function criarPessoaCompleta({ pessoa, pesFisica, pesJuridica, enderecos, tipo }) {
  console.log('========== INÍCIO CRIAÇÃO DE PESSOA ==========');

  // 🔍 Log completo de entrada
  console.log('[INPUT] Pessoa:', pessoa);
  console.log('[INPUT] Tipo:', tipo);
  console.log('[INPUT] PF:', pesFisica);
  console.log('[INPUT] PJ:', pesJuridica);
  console.log('[INPUT] Endereços:', enderecos);

  // ✅ Inserção na tabela pessoa
  console.log('[DEBUG] Inserindo pessoa...');
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert({
      nome: pessoa.nome,
      id_tipo: tipo.id
    })
    .select()
    .single();

  if (erroPessoa) {
    console.error('[ERRO] Falha ao inserir pessoa:', erroPessoa);
    return { error: erroPessoa };
  }

  const idPessoa = novaPessoa?.id;
  console.log('[OK] Pessoa inserida. ID:', idPessoa);

  // 🧍 Inserção na tabela pessoa_fisica (se existir)
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

    if (erroFisica) {
      console.error('[ERRO] pessoa_fisica:', erroFisica);
      return { error: erroFisica };
    }

    console.log('[OK] Pessoa física inserida.');
  }

  // 🏢 Inserção na tabela pessoa_juridica (se existir)
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

    if (erroJuridica) {
      console.error('[ERRO] pessoa_juridica:', erroJuridica);
      return { error: erroJuridica };
    }

    console.log('[OK] Pessoa jurídica inserida.');
  }

  // 🏠 Inserção dos endereços
  if (enderecos?.length > 0) {
    console.log('[DEBUG] Inserindo endereços...');
    const dadosEndereco = enderecos.map(e => ({
      ...e,
      id_pessoa: idPessoa
    }));

    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);

    if (erroEndereco) {
      console.error('[ERRO] enderecos:', erroEndereco);
      return { error: erroEndereco };
    }

    console.log('[OK] Endereços inseridos.');
  } else {
    console.log('[INFO] Nenhum endereço informado.');
  }

  console.log('========== FIM CRIAÇÃO DE PESSOA ==========');

  return { idPessoa, success: true };
}
