// 1. Importe a biblioteca do Sequelize
const Sequelize = require('sequelize');

// 2. Crie a instância da conexão e atribua à variável 'sequelize'
const sequelize = new Sequelize('blogapp', 'root', '6863', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false 
});

// 3. (Opcional, mas recomendado) Verifique se a conexão foi bem-sucedida
sequelize.authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados realizada com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao conectar com o banco de dados: ", error);
    });

// 4. Exporte a conexão para que outros arquivos (como seus Models) possam usá-la
module.exports = sequelize;