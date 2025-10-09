const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categorias');
const Postagem = require('../models/Postagem');

// Rota principal do admin
router.get('/', (req, res) => {
    res.render("admin/index");
});

// Rota de categorias
router.get('/categorias', (req, res) => {
    Categoria.findAll().then((categorias) => {
        res.render("admin/categorias", { categorias: categorias.map(c => c.toJSON()) });
    });
});

// Rota de postagens
router.get("/postagens", (req, res) => {
    Postagem.findAll({
        include: [{ model: Categoria, as: 'categoria' }],
        order: [['data', 'DESC']],
        raw: true,
        nest: true
    })
    .then((postagens) => {
        res.render("admin/postagens", { postagens });
    })
    .catch((err) => {
        console.error("Erro ao listar postagens:", err);
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
    });
});

module.exports = router;
