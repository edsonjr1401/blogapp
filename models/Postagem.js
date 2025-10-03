const { DataTypes } = require('sequelize');
const db = require('../config/bd');
const Categoria = require('./Categoria');

const Postagem = db.define('Postagem', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
},

    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao:{
        type: DataTypes.TEXT,
        allowNull: false
},
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    }       

});

Postagem.belongsTo(Categoria);

module.exports = Postagem;