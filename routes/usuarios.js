const express = require('express')
const router = express.Router()
const Usuario = require("../models/Usuarios")

router.get("/registro", (req, res) => {
    res.render("usuarios/registros")
})

module.exports = router