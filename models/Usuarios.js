const { DataTypes } = require('sequelize');
const db = require('../config/bd'); 

const Usuario = db.define('NomeDoModelo', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    eAdmin: {
        DataTypes: Number,
        default: 0
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
 {
    tableName: 'nome_da_tabela'
});

module.exports = Usuario;