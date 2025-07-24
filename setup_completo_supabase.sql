-- ======= Criação das tabelas =======
drop table if exists public.pessoa_endereco cascade;
drop table if exists public.endereco_base cascade;
drop table if exists public.pessoa_fisica cascade;
drop table if exists public.pessoa_juridica cascade;
drop table if exists public.operador cascade;
drop table if exists public.pessoa_db cascade;
drop table if exists public.pessoa cascade;
drop table if exists public.finalidade cascade;
drop table if exists public.tipo cascade;

-- 1. Tabela tipo
create table tipo (
  id serial primary key,
  descricao text not null unique,
  indice_tipo int not null
);

-- 2. Tabela pessoa
create table pessoa (
  id bigserial primary key,
  nome text not null,
  id_tipo int not null references tipo(id)
);

-- 3. Pessoa jurídica
create table pessoa_juridica (
  id_pessoa bigint primary key references pessoa(id) on delete cascade,
  cnpj text unique,
  inscricao_estadual text,
  inscricao_municipal text,
  razao_social text not null
);

-- 4. Pessoa física
create table pessoa_fisica (
  id_pessoa bigint primary key references pessoa(id) on delete cascade,
  cpf text unique,
  numero_registro text,
  orgao_expedidor text,
  data_expedicao date
);

-- 5. Tabela operador
create table operador (
  id bigserial primary key,
  id_pessoa bigint unique not null references pessoa(id) on delete cascade,
  id_banco bigint not null references pessoa(id),
  codigo text unique not null,
  indice_perfil int not null
);

-- 6. Tabela pessoa_db (relacionamento genérico pessoa-pessoa)
create table pessoa_db (
  id bigserial primary key,
  id_pessoa bigint not null references pessoa(id),
  id_relacao bigint not null references pessoa(id)
);

-- 7. Tabela finalidade (finalidade do endereço)
create table finalidade (
  id serial primary key,
  descricao text not null unique
);

-- 8. Tabela endereco_base (endereço normalizado)
create table endereco_base (
  cep text primary key,
  logradouro text not null,
  bairro text not null,
  cidade text not null,
  estado text not null,
  pais text not null default 'Brasil'
);

-- 9. Tabela pessoa_endereco vinculando pessoa, endereço base e finalidade
create table pessoa_endereco (
  id bigserial primary key,
  id_pessoa bigint not null references pessoa(id) on delete cascade,
  cep text not null references endereco_base(cep),
  numero text null,
  complemento text null,
  id_finalidade int not null references finalidade(id),
  criado_em timestamp with time zone not null default now()
);

-- ======= Inserção dos dados =======

-- Tipos
insert into tipo (descricao, indice_tipo) values
('Suporte', 0),
('Banco', 1),
('Proprietario', 2),
('Gerente', 3),
('Operador', 4),
('Cliente', 5),
('Fornecedor', 6);

-- Finalidade
insert into finalidade (descricao) values
('Residência'),
('Entrega'),
('Comercial'),
('Outro');

-- Pessoas
insert into pessoa (nome, id_tipo) values
('Edgar Batista da Silva Filho', 1),  -- Suporte
('Fante NE Ltda.', 2),                -- Banco
('Fabio Navarro', 3),                 -- Proprietario
('Osvaldo Santos', 4),                -- Proprietario (corrigido índice)
('João Victor', 5),                   -- Proprietario (corrigido índice)
('Josimar Silva', 5),                 -- Proprietario (corrigido índice)
('Mix Mateus', 6),                    -- Cliente (índice 5)
('World Jat', 7);                    -- Fornecedor (índice 6)

-- Pessoa jurídica
insert into pessoa_juridica (id_pessoa, cnpj, inscricao_estadual, inscricao_municipal, razao_social) values
(2, '12.345.678/0001-90', '123456789', '987654321', 'Fante NE Ltda.');

-- Pessoa física
insert into pessoa_fisica (id_pessoa, cpf, numero_registro, orgao_expedidor, data_expedicao) values
(1, '123.456.789-00', 'RG12345', 'SSP', '2000-01-01'),
(3, '987.654.321-00', 'RG54321', 'SSP', '2005-05-05');

-- Operadores
insert into operador (id_pessoa, id_banco, codigo, indice_perfil) values
(3, 2, 'FABIO01', 2),  -- Fabio Navarro (Proprietario)
(4, 2, 'OSVALDO01', 3),-- Osvaldo Santos (Gerente)
(5, 2, 'JOAO01', 3),   -- João Victor (Gerente)
(6, 2, 'JOSIMAR01', 3),-- Josimar Silva (Gerente)
(7, 2, 'MIX01', 5);    -- Mix Mateus (Cliente)

-- Pessoa_db (relacionamento genérico)
insert into pessoa_db (id_pessoa, id_relacao) values
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2);

-- Endereço base
insert into endereco_base (cep, logradouro, bairro, cidade, estado) values
('01234-567', 'Rua das Flores', 'Jardim Primavera', 'São Paulo', 'SP'),
('23456-789', 'Rua das Laranjeiras', 'Bela Vista', 'Rio de Janeiro', 'RJ');

-- Endereços vinculados
insert into pessoa_endereco (id_pessoa, cep, numero, complemento, id_finalidade) values
(1, '01234-567', '123', null, 1), -- Residência
(1, '01234-567', '456', 'Apto 101', 3), -- Comercial
(2, '23456-789', '789', null, 2); -- Entrega

-- ======= Views =======

-- Função auxiliar para formatar documento (remove caracteres não numéricos)
create or replace function formatar_documento(doc text) returns text language sql immutable as $$
  select regexp_replace(doc, '[^0-9]', '', 'g')
$$;

-- View completa com pessoas, operadores, banco, tipo, documentos e endereços
create or replace view vw_pessoa_completa as
select
  p.id,
  lpad(p.id::text, 6, '0') as codigo,
  p.nome,
  t.descricao as tipo_descricao,
  t.indice_tipo,
  o.codigo as operador_codigo,
  o.indice_perfil,
  b.nome as nome_banco,
  coalesce(pj.razao_social, p.nome) as nome_ou_razao_social,
  formatar_documento(coalesce(pj.cnpj, pf.cpf)) as documento,
  (
    select json_agg(json_build_object(
      'logradouro', eb.logradouro,
      'bairro', eb.bairro,
      'cidade', eb.cidade,
      'estado', eb.estado,
      'cep', eb.cep,
      'pais', eb.pais,
      'numero', e.numero,
      'complemento', e.complemento,
      'finalidade', f.descricao
    ))
    from pessoa_endereco e
    join endereco_base eb on e.cep = eb.cep
    join finalidade f on e.id_finalidade = f.id
    where e.id_pessoa = p.id
  ) as enderecos
from pessoa p
left join tipo t on p.id_tipo = t.id
left join operador o on o.id_pessoa = p.id
left join pessoa b on o.id_banco = b.id
left join pessoa_juridica pj on pj.id_pessoa = p.id
left join pessoa_fisica pf on pf.id_pessoa = p.id;

-- View reduzida com id, nome/razão social, documento e código formatado
create or replace view vw_pessoa_reduzida as
select
  p.id,
  lpad(p.id::text, 6, '0') as codigo,
  coalesce(pj.razao_social, p.nome) as nome_ou_razao_social,
  formatar_documento(coalesce(pj.cnpj, pf.cpf)) as documento
from pessoa p
left join pessoa_juridica pj on pj.id_pessoa = p.id
left join pessoa_fisica pf on pf.id_pessoa = p.id;
