const { DataTypes } = require('sequelize');
const db = require('../config/bd'); // Sua conexão importada

// Use 'db', a variável que contém sua conexão, para definir o model
const Categoria = db.define('Categoria', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// É bom garantir que a tabela seja criada no banco de dados
Categoria.sync({ alter: true });

module.exports = Categoria;