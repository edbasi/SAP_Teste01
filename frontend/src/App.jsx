import { useEffect, useState } from 'react';

function App() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);

  // Buscar lista de clientes
  const carregarClientes = () => {
    fetch('https://sap-backend-in48.onrender.com//clientes')
      .then((res) => res.json())
      .then((data) => {
        setClientes(data);
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao carregar clientes');
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Cadastrar novo cliente
  const cadastrarCliente = (e) => {
    e.preventDefault();

    fetch('https://sap-backend-in48.onrender.com//clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao cadastrar');
        return res.json();
      })
      .then(() => {
        setNome('');
        setEmail('');
        carregarClientes();
      })
      .catch(() => {
        alert('Erro ao cadastrar cliente.');
      });
  };

  // Atualizar cliente
  const atualizarCliente = (e) => {
    e.preventDefault();
    fetch(`https://sap-backend-in48.onrender.com//clientes/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email }),
    })
      .then(() => {
        setEditando(null);
        setNome('');
        setEmail('');
        carregarClientes();
      })
      .catch(() => alert('Erro ao atualizar cliente.'));
  };

  // Excluir cliente
  const excluirCliente = (id) => {
    fetch(`https://sap-backend-in48.onrender.com//clientes/${id}`, {
      method: 'DELETE',
    }).then(() => carregarClientes());
  };

  // Iniciar edição
  const iniciarEdicao = (cliente) => {
    setEditando(cliente);
    setNome(cliente.nome);
    setEmail(cliente.email);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>📋 Lista de Clientes</h1>

      <form onSubmit={editando ? atualizarCliente : cadastrarCliente}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ marginRight: '1rem' }}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">{editando ? 'Salvar Edição' : 'Cadastrar'}</button>
        {editando && (
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setNome('');
              setEmail('');
            }}
            style={{ marginLeft: '1rem' }}
          >
            Cancelar
          </button>
        )}
      </form>

      <hr />

      {loading ? (
        <p>Carregando clientes...</p>
      ) : clientes.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        <ul>
          {clientes.map((c) => (
            <li key={c.id}>
              <strong>{c.nome}</strong> — {c.email}{' '}
              <button onClick={() => excluirCliente(c.id)}>🗑️ Excluir</button>{' '}
              <button onClick={() => iniciarEdicao(c)}>✏️ Editar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
