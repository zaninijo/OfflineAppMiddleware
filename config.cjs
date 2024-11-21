// o node faz birra com importação de JSON em ESM, então tive que criar esse CJS para exportar as configurações.

const config = require("./config.json");

module.exports = config;