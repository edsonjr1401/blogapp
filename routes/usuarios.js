const express = require('express');
const router = express.Router();
const Usuario = require("../models/Usuarios");
const bcrypt = require("bcryptjs");

// Rota GET - Exibe o formulário de registro
router.get("/registros", (req, res) => {
    res.render("usuarios/registros");
});

// Rota POST - Cadastra o usuário
router.post("/registros", async (req, res) => {
    // =========================================================================
    // CÓDIGO FUNCIONAL DE VALIDAÇÃO E REGISTRO ATIVADO
    // =========================================================================
    const erros = [];

    if (!req.body.nome) erros.push({ texto: "Nome inválido" });
    if (!req.body.email) erros.push({ texto: "E-mail inválido" });
    if (!req.body.senha) erros.push({ texto: "Senha inválida" });
    if (req.body.senha && req.body.senha.length < 4) erros.push({ texto: "Senha muito curta" });
    if (req.body.senha !== req.body.senha2) erros.push({ texto: "As senhas são diferentes" });

    if (erros.length > 0) {
        return res.render("usuarios/registros", { erros });
    }

    try {
        const usuarioExistente = await Usuario.findOne({ where: { email: req.body.email } });
        if (usuarioExistente) {
            req.flash("error_msg", "Já existe uma conta com este e-mail");
            return res.redirect("/usuarios/registros");
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(req.body.senha, salt);

        await Usuario.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: senhaHash
        });

        req.flash("success_msg", "Usuário criado com sucesso!");
        res.redirect("/");
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        req.flash("error_msg", "Erro ao criar usuário, tente novamente! Detalhes: " + err.message);
        res.redirect("/usuarios/registros");
    }
});


router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

module.exports = router;
