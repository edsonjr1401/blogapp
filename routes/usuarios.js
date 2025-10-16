const express = require('express')
const router = express.Router()
const Usuario = require("../models/Usuarios")
const bcrypt = require("bcryptjs")

router.get("/registros", (req, res) => {
    console.log("Rota /registros foi chamada!");
    res.render("usuarios/registros")
})

router.post("/registros", async (req, res) => {
    const erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registros", { erros: erros })
    } else {
        try {
            const usuarioExistente = await Usuario.findOne({
                where: { email: req.body.email }
            })

            if (usuarioExistente) {
                req.flash("error_msg", "Já existe uma conta com este e-mail no sistema")
                return res.redirect("/usuarios/registros")
            }

            const salt = await bcrypt.genSalt(10)
            const senhaHash = await bcrypt.hash(req.body.senha, salt)

            await Usuario.create({
                nome: req.body.nome,
                email: req.body.email,
                senha: senhaHash
            })

            req.flash("success_msg", "Usuário criado com sucesso!")
            res.redirect("/")

        } catch (err) {
            console.error("Erro ao registrar usuário:", err)
            req.flash("error_msg", "Houve um erro ao criar usuário, tente novamente!")
            res.redirect("/usuarios/registros")
        }
    }
})

module.exports = router