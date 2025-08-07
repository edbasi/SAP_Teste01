import { supabase } from './supabaseClient'; // ou o caminho correto para seu supabase
import { log, error } from './logger.js';

export async function criarPessoaCompleta({ r_pessoa, a_contatos, a_enderecos }) {
  log('==========sddfsdfsdsd INÍCIO CRIAÇÃO DE PESSOA  dsfsdfsdsd ==========');

  if (!r_pessoa) return { error: 'Dados Inválidos' };

  try {
    log('[INPUT] Pessoa:', r_pessoa);

    if (!r_pessoa.s_Nome) return { error: 'Nome da pessoa é obrigatório' };
    if (!r_pessoa.s_Classe) return { error: 'Descrição do tipo é obrigatória' };

    if (r_pessoa.s_CpfPessoa) {
      log('[DEBUG] Buscando Pessoa Física...');
      
      const { data: r_CpfPessoa } = await supabase
        .from('CadCpfPessoa')
        .select('idPessoa')
        .eq('DesCCpfPessoalasse', r_pessoa.s_CpfPessoa)
        .single();
      
    }

    r_pessoa.i_Pessoa = r_CpfPessoa.idPessoa;
    }

    log('[DEBUG] Buscando tipo da Pessoa...');

    const { data: r_tipo, error: erroTipo } = await supabase
      .from('TabPesClasse')
      .select('id, TipClasse')
      .eq('DesClasse', r_pessoa.s_Classe)
      .single();

    if (erroTipo || !r_tipo) {
      error('[ERRO] Tipo:', erroTipo, r_tipo);
      return { error: erroTipo?.message || 'Tipo não encontrado' };
    }

    const i_Tipo = r_tipo.id;
    const s_Tipo = r_tipo.TipClasse;

    log('[DEBUG] Inserindo Pessoa...');

    const { data: r_sucesso, error: r_erro } = await supabase
      .from('CadPessoa')
      .upsert({
        id: r_pessoa.i_Pessoa,
        NomPessoa: r_pessoa.s_Nome,
        idClassePessoa: i_Tipo,
        TipClasse: s_Tipo
      }, { onConflict: 'id' })
      .select()
      .single();

    if (r_erro) {
      throw {
        origem: 'pessoa',
        mensagem: 'Erro ao inserir pessoa',
        detalhes: r_erro
      };
    }

    const i_Pessoa = r_sucesso.id;
    log('[OK] Pessoa inserida:', r_sucesso);

    if (r_pessoa.s_CpfPessoa) {
      log('[DEBUG] Inserindo Pessoa Física...');

      const { error: erroCPF } = await supabase
        .from('CadCpfPessoa')
        .upsert({
          idPessoa: i_Pessoa,
          CpfPessoa: r_pessoa.s_CpfPessoa,
          NumRegistro: r_pessoa.s_NumRegistro ?? null,
          OrgExpedidor: r_pessoa.s_OrgRegistro ?? null,
          DatExpedicao: r_pessoa.d_ExpRegistro ?? null
        }, { onConflict: 'idPessoa' })
        .select()
        .single();

      if (erroCPF) {
        throw {
          origem: 'Pessoa Física',
          mensagem: 'Erro ao inserir/atualizar Pessoa Física',
          detalhes: erroCPF
        };
      }

      log('[OK] Pessoa Física inserida ou atualizada.');

      const { error: erroDelCNPJ } = await supabase
        .from('CadCgcPessoa')
        .delete()
        .eq('idPessoa', i_Pessoa);

      if (erroDelCNPJ) {
        error('[AVISO] Não foi possível remover CNPJ vinculado:', erroDelCNPJ);
      } else {
        log('[OK] CNPJ vinculado removido com sucesso (se existia).');
      }
    }

    if (r_pessoa.s_CgcPessoa) {
      log('[DEBUG] Inserindo Pessoa Jurídica...');

      const { error: erroCNPJ } = await supabase
        .from('CadCgcPessoa')
        .upsert({
          idPessoa: i_Pessoa,
          CgcPessoa: r_pessoa.s_CgcPessoa,
          InscEstadual: r_pessoa.s_InscEstadual ?? null,
          InscMunicipal: r_pessoa.s_InscMunicipal ?? null,
          RazSocial: r_pessoa.s_RazSocial ?? r_pessoa.s_Nome
        }, { onConflict: 'idPessoa' })
        .select()
        .single();

      if (erroCNPJ) {
        throw {
          origem: 'Pessoa Jurídica',
          mensagem: 'Erro ao inserir/atualizar Pessoa Jurídica',
          detalhes: erroCNPJ
        };
      }

      log('[OK] Pessoa Jurídica inserida ou atualizada.');

      const { error: erroDelCPF } = await supabase
        .from('CadCpfPessoa')
        .delete()
        .eq('idPessoa', i_Pessoa);

      if (erroDelCPF) {
        error('[AVISO] Não foi possível remover CPF vinculado:', erroDelCPF);
      } else {
        log('[OK] CPF vinculado removido com sucesso (se existia).');
      }
    }

    log('========== FIM CRIAÇÃO DE PESSOA ==========');
    return { idPessoa: i_Pessoa, success: true };

  } catch (erro) {
    error('[FALHA]', erro);

    // Logar também no banco, se necessário
    await supabase.from('log_erro').insert({
      origem: erro.origem ?? 'desconhecido',
      mensagem: erro.mensagem ?? 'Erro desconhecido',
      detalhes: erro.detalhes ?? {}
    });

    return { error: erro };
  }
}
