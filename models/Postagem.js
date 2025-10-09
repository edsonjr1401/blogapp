const { DataTypes } = require('sequelize');
const db = require('../config/bd');
const Categorias = require('./Categorias');

const Postagem = db.define('Postagem', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    categoriaId: { 
        type: DataTypes.INTEGER,
        references: {
            model: 'Categorias', 
            key: 'id'
        }
    }
});

Postagem.belongsTo(Categorias, { 
    foreignKey: 'categoriaId', 
    as: 'categorias' 
});

module.exports = Postagem;
