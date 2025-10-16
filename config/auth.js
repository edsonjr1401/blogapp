// config/passport.js (ou o nome do seu arquivo de configuração)

const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Supondo que você exportou sua instância do Sequelize e suas Models
// Este caminho deve apontar para o arquivo onde suas Models estão definidas e exportadas.
const db = require("../models"); 
const Usuario = db.Usuario; // Usaremos a model 'Usuario' do Sequelize

module.exports = function(passport) {

    // 1. ESTRATÉGIA LOCAL (Autenticação)
    passport.use(new localStrategy({ 
        // Define que o campo que Passport deve usar para o 'username' é o 'email'
        usernameField: 'email',
        // O campo da senha é 'senha' por padrão, mas pode ser explicitado se necessário
        passwordField: 'senha' 
    }, async (email, senha, done) => {

        try {
            // Busca o usuário no banco de dados pelo email (Sequelize)
            const usuario = await Usuario.findOne({ where: { email: email } });

            // Se o usuário não existir
            if (!usuario) {
                // done(erro, usuário, mensagem)
                return done(null, false, { message: "Esta conta não existe" });
            }
            
            // Compara a senha digitada com a senha HASH armazenada no banco (bcryptjs)
            // O nome correto da função é 'compare', não 'campare'
            const batem = await bcrypt.compare(senha, usuario.senha); 

            if (batem) {
                // Senha correta: retorna o usuário
                // Se sua model for 'usuario', use 'usuario' aqui. No seu código Mongoose estava 'user', mas usaremos 'usuario' para consistência.
                return done(null, usuario.get()); // O .get() é bom para retornar um objeto JS limpo
            } else {
                // Senha incorreta
                return done(null, false, { message: "Senha incorreta" });
            }
            
        } catch (err) {
            console.error("Erro na autenticação local:", err);
            return done(err);
        }
    }));


    // 2. SERIALIZAÇÃO (Salva o ID do usuário na sessão)
    passport.serializeUser((usuario, done) => {
        // Sequilize user object tem o ID. Usamos o 'id' (minúsculo)
        done(null, usuario.id); 
    });


    // 3. DESSERIALIZAÇÃO (Busca o usuário a cada requisição)
    passport.deserializeUser(async (id, done) => {
        try {
            // Busca o usuário pelo ID (Método do Sequelize)
            const usuario = await Usuario.findByPk(id); 

            if (usuario) {
                // Retorna o objeto usuário encontrado
                done(null, usuario.get()); // .get() novamente para um objeto limpo
            } else {
                // Usuário não encontrado
                done(null, false);
            }
        } catch (err) {
            console.error("Erro na desserialização:", err);
            done(err);
        }
    });
};2