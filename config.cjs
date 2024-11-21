// o node faz birra com importação de JSON em ESM, então tive que criar esse CJS para exportar as configurações.
// já aproveitei esse script para adicionar as chaves de API

require('dotenv').config();

const keys = JSON.parse(process.env.KEYS)
const cfg = require("./config.json")

const config = {
    ...cfg,
    keys
};


module.exports = config;