// models/Categorias.js

const { DataTypes } = require('sequelize');
const db = require('../config/bd');

const Categorias = db.define('Categorias', {
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

module.exports = Categorias;