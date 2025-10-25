const { Sequelize } = require('sequelize');
// 1. Usar dotenv para carregar variáveis de ambiente para segurança
// const dotenv = require('dotenv');
// dotenv.config(); 

// 2. Definir parâmetros de conexão de forma mais segura
const DB_NAME = 'blogapp'; 
const DB_USER = 'root'; 
// *** MELHORIA DE SEGURANÇA CRÍTICA: Use Variáveis de Ambiente para Senhas! ***
// const DB_PASS = process.env.DB_PASS || '6863'; 
const DB_PASS = '6863'; // Manteremos a senha aqui apenas para que o código seja executável
const DB_HOST = 'localhost';
const DB_DIALECT = 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    // 3. Otimização: Configurações do Pool de Conexões (opcional, mas recomendado)
    pool: {
        max: 5,        // Máximo de 5 conexões simultâneas
        min: 0,        // Mínimo de 0 conexões em espera
        acquire: 30000, // Tentar adquirir conexão por 30s
        idle: 10000     // Liberar conexão ociosa após 10s
    },
    // 4. Logging: Manter o logging desativado (logging: false)
    logging: false
});

// 5. Encapsular a lógica de conexão/sincronização em uma função
async function connectAndSync() {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexão com o banco de dados realizada com sucesso!");
        
        // Use 'alter: true' (para atualizar tabelas existentes sem deletar dados)
        // OU 'force: true' (para recriar todas as tabelas, PERDENDO DADOS)
        await sequelize.sync({ alter: true });
        console.log("✨ Tabelas sincronizadas com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar ou sincronizar:", error.message);
        // Sugestão: Terminar o processo se a conexão falhar criticamente
        // process.exit(1); 
    }
}

// 6. Chamar a função apenas se o módulo for executado diretamente
// if (require.main === module) {
//     connectAndSync();
// }

// Exporta a instância do Sequelize para ser usada nos Modelos
module.exports = sequelize;