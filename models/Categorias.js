const { DataTypes } = require('sequelize');
const db = require('../config/database'); 

const Categoria = db.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "O nome da categoria não pode ser vazio."
            }
        }
    }, 
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
        validate: {
            notEmpty: {
                msg: "O slug não pode ser vazio."
            }
        }
    },
    date: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'categorias',
    timestamps: true,
    freezeTableName: true
});

module.exports = Categoria;