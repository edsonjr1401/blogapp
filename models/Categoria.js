// models/Categoria.js

const { DataTypes } = require('sequelize');
const db = require('../config/bd');

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
}, {
    // Mapeia o modelo para a tabela 'categorias' no banco de dados
    tableName: 'categorias' 
});

module.exports = Categoria;