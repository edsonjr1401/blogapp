const express = require('express')
const router = express.Router()
const Usuario = require("../models/Usuarios")

router.get("/registro", (req, res) => {
    res.render("usuarios/registros")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.name == null){
        erros.push({texto: "Nome invalido"})

    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail invalido"})

    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto:"Senha muito curta"})
    }

    if(erros.length > 0){

        res.render("usuarios/registro")

    }       
    

})



module.exports = router