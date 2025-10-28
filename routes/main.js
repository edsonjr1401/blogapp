
// =======================================================================
// IMPORTAÇÕES
// =======================================================================
const express = require('express');
const router = express.Router();
const Postagem = require('../models/Postagem');
const Categorias = require('../models/Categorias');

// =======================================================================
// ROTAS PÚBLICAS
// =======================================================================

// Página Inicial - Listagem de Postagens
router.get('/', async (req, res) => {
    try {
        const postagens = await Postagem.findAll({
            include: [{
                model: Categorias,
                as: 'categorias',
                attributes: ['nome']
            }],
            raw: true,
            nest: true,
            order: [['data', 'DESC']]
        });

        res.render("index", { postagens });

    } catch (err) {
        console.error("Erro ao carregar postagens:", err);
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/404");
    }
});

// Postagem Individual
router.get("/postagem/:slug", async (req, res) => {
    try {
        const postagem = await Postagem.findOne({
            where: { slug: req.params.slug },
            include: [{
                model: Categorias,
                as: 'categorias'
            }],
            raw: true,
            nest: true
        });

        if (postagem) {
            res.render("postagem/index", { postagem });
        } else {
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/");
        }

    } catch (err) {
        console.error("Erro ao carregar postagem:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar a postagem.");
        res.redirect("/");
    }
});

// Listagem de Categorias
router.get("/categorias", async (req, res) => {
    try {
        const categorias = await Categorias.findAll({
            raw: true,
            order: [['nome', 'ASC']]
        });

        res.render("categorias/index", { categorias });

    } catch (err) {
        console.error("Erro ao listar categorias:", err);
        req.flash("error_msg", "Houve um erro interno ao listar as categorias.");
        res.redirect("/");
    }
});

// Postagens por Categoria
router.get("/categorias/:slug", async (req, res) => {
    try {
        const categoria = await Categorias.findOne({
            where: { slug: req.params.slug },
            raw: true
        });

        if (!categoria) {
            req.flash("error_msg", "Essa categoria não existe");
            return res.redirect("/");
        }

        const postagens = await Postagem.findAll({
            where: { categoriaId: categoria.id },
            order: [['data', 'DESC']],
            raw: true,
            nest: true
        });

        res.render("categorias/postagens", { postagens, categoria });

    } catch (err) {
        console.error("Erro ao carregar categoria:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.");
        res.redirect("/");
    }
});

// Página de Erro 404
router.get("/404", (req, res) => {
    res.render("404");
});

module.exports = router;
