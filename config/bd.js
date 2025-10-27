const { Sequelize } = require('sequelize');
// require('dotenv').config(); // Descomente se estiver usando dotenv

const DB_NAME = process.env.DB_NAME || 'blogapp';
const DB_USER = process.env.DB_USER || 'root'; 
const DB_PASS = process.env.DB_PASS || '6863';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    
    pool: {
        max: 5,        
        min: 0,        
        acquire: 30000,
        idle: 10000    
    },
    
    logging: false,
    define: {
        freezeTableName: true 
    },
});

module.exports = sequelize;