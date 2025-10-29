// =======================================================================
// IMPORTAÇÕES
// =======================================================================
const express = require('express');
const bcrypt = require("bcryptjs");
const passport = require("passport");

const router = express.Router();
const Usuario = require("../models/Usuarios");
const { eAdmin } = require('../helpers/eAdmin');

// =======================================================================
// VALIDAÇÕES
// =======================================================================

/**
 * Valida os dados de registro do usuário
 * @param {Object} body - Corpo da requisição
 * @returns {Array} - Array de erros (vazio se válido)
 */
function validarRegistro(body) {
    const erros = [];

    if (!body.nome) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!body.email) {
        erros.push({ texto: "E-mail inválido" });
    }

    if (!body.senha) {
        erros.push({ texto: "Senha inválida" });
    } else if (body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta (mínimo 4 caracteres)" });
    }

    if (body.senha !== body.senha2) {
        erros.push({ texto: "As senhas não coincidem" });
    }

    return erros;
}

// =======================================================================
// ROTAS DE REGISTRO
// =======================================================================

// GET - Formulário de Registro
router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

// POST - Cadastrar Novo Usuário
router.post("/registro", async (req, res) => {
    try {
        // Validação dos dados
        const erros = validarRegistro(req.body);
        if (erros.length > 0) {
            return res.render("usuarios/registro", { erros });
        }

        // Verifica se o e-mail já existe
        const usuarioExistente = await Usuario.findOne({ 
            where: { email: req.body.email } 
        });

        if (usuarioExistente) {
            req.flash("error_msg", "Já existe uma conta com este e-mail");
            return res.redirect("/usuarios/registro");
        }

        // Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(req.body.senha, salt);

        // Cria o usuário
        await Usuario.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: senhaHash
        });

        req.flash("success_msg", "Usuário criado com sucesso!");
        res.redirect("/usuarios/login");

    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        req.flash("error_msg", "Erro ao criar usuário. Tente novamente!");
        res.redirect("/usuarios/registro");
    }
});

// =======================================================================
// ROTAS DE LOGIN
// =======================================================================

// GET - Formulário de Login
router.get("/login", (req, res) => {
    res.render("usuarios/login");
});

// POST - Autenticar Usuário
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next);
});

// =======================================================================
// ROTA DE LOGOUT
// =======================================================================

// GET - Deslogar Usuário
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error("Erro ao fazer logout:", err);
            return next(err);
        }
        
        req.flash("success_msg", "Desconectado com sucesso!");
        res.redirect("/");
    });
});

// =======================================================================
// EXPORTAÇÃO
// =======================================================================
module.exports = router;