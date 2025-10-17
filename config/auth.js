const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// =======================================================================
// CONFIGURAÇÃO DO SEQUELIZE E MODEL
// =======================================================================
const db = require("../models/Usuarios"); 
const Usuario = db.Usuario; // Model 'Usuario' do Sequelize

module.exports = function(passport) {

    // =======================================================================
    // 1. ESTRATÉGIA LOCAL (LOGIN)
    // =======================================================================
    passport.use(new localStrategy({ 
        usernameField: 'email',
        passwordField: 'senha' 
    }, async (email, senha, done) => {

        try {
            // Busca o usuário pelo email no banco (Sequelize)
            const usuario = await Usuario.findOne({ where: { email: email } });

            // Se o usuário não existe
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" });
            }
            
            // Compara a senha digitada com o HASH armazenado (bcrypt)
            const batem = await bcrypt.compare(senha, usuario.senha); 

            if (batem) {
                // Senha correta: retorna o objeto usuário
                return done(null, usuario.get()); 
            } else {
                // Senha incorreta
                return done(null, false, { message: "Senha incorreta" });
            }
            
        } catch (err) {
            // Trata erros de busca ou comparação
            console.error("Erro na autenticação local:", err);
            return done(err);
        }
    }));


    // =======================================================================
    // 2. SERIALIZAÇÃO (SESSÃO)
    // =======================================================================
    // Salva apenas o ID do usuário na sessão
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id); 
    });


    // =======================================================================
    // 3. DESSERIALIZAÇÃO (RECUPERAÇÃO DA SESSÃO)
    // =======================================================================
    // Busca o usuário completo pelo ID salvo na sessão
    passport.deserializeUser(async (id, done) => {
        try {
            // Busca pelo ID (findByPk do Sequelize)
            const usuario = await Usuario.findByPk(id); 

            if (usuario) {
                // Retorna o objeto usuário
                done(null, usuario.get()); 
            } else {
                // Usuário não encontrado
                done(null, false);
            }
        } catch (err) {
            // Trata erros de busca
            console.error("Erro na desserialização:", err);
            done(err);
        }
    });
};
