// routes/cliente.js
const express = require('express');
const { createCrudPessoaTipo } = require('../utils/crudPessoaTipo');
module.exports = createCrudPessoaTipo({ tipoDescricao: 'Cliente', indiceTipo: 5 });

// routes/fornecedor.js
const express = require('express');
const { createCrudPessoaTipo } = require('../utils/crudPessoaTipo');
module.exports = createCrudPessoaTipo({ tipoDescricao: 'Fornecedor', indiceTipo: 6 });

// routes/operador.js
const express = require('express');
const { createCrudPessoaTipo } = require('../utils/crudPessoaTipo');
module.exports = createCrudPessoaTipo({ tipoDescricao: 'Operador', indiceTipo: 4 });

// routes/banco.js
const express = require('express');
const { createCrudPessoaTipo } = require('../utils/crudPessoaTipo');
module.exports = createCrudPessoaTipo({ tipoDescricao: 'Banco', indiceTipo: 1 });
