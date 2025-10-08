// 1. Importe a biblioteca do Sequelize
const Sequelize = require('sequelize');

// 2. Crie a instância da conexão e atribua à variável 'sequelize'
const sequelize = new Sequelize('blogapp', 'root', '6863', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false 
});

// 3. Verifique se a conexão foi bem-sucedida E sincronize as tabelas
sequelize.authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados realizada com sucesso!");
        return sequelize.sync();  // ← CRIA/RECRIA AS TABELAS
    })
    .then(() => {
        console.log("Tabelas sincronizadas com sucesso!");
    })
    .catch((error) => {
        console.error("Erro: ", error);
    });

// 4. Exporte a conexão
module.exports = sequelize;