const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'blofapp', 'senha', {
  host: 'localhost',
  dialect: 'mysql'
});

const Categoria = sequelize.define('Categoria', {
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

module.exports = Categoria;