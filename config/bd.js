const Sequelize = require('sequelize');


const sequelize = new Sequelize('blogapp', 'root', '6863', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

sequelize.authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados realizada com sucesso!");
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("Tabelas sincronizadas com sucesso!");
    })
    .catch((error) => {
        console.error("Erro: ", error);
    });


module.exports = sequelize;