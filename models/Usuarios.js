const { DataTypes } = require('sequelize');
const db = require('../config/bd');

const Usuario = db.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    eAdmin: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'usuarios'
});

module.exports = Usuario;