// services/pessoaService.js
const supabase = require('../db');

async function criarPessoaCompleta({ pessoa, documentos, enderecos }) {
  const { data: novaPessoa, error: erroPessoa } = await supabase
    .from('pessoa')
    .insert(pessoa)
    .select()
    .single();

  if (erroPessoa) return { error: erroPessoa };

  const idPessoa = novaPessoa.id;

  // Documento
  if (documentos?.cpf || documentos?.cnpj) {
    const docTable = documentos.cpf ? 'pessoa_fisica' : 'pessoa_juridica';
    const { error: erroDoc } = await supabase.from(docTable).insert({
      ...documentos,
      id: idPessoa,
    });
    if (erroDoc) return { error: erroDoc };
  }

  // Endereços
  if (enderecos?.length > 0) {
    const dadosEndereco = enderecos.map(e => ({ ...e, id_pessoa: idPessoa }));
    const { error: erroEndereco } = await supabase
      .from('pessoa_endereco')
      .insert(dadosEndereco);
    if (erroEndereco) return { error: erroEndereco };
  }

  return { data: novaPessoa };
}

module.exports = {
  criarPessoaCompleta
};
