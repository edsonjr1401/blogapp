
// =======================================================================
// IMPORTAÇÕES
// =======================================================================
const express = require('express');
const router = express.Router();
const Postagem = require('../models/Postagem');
const Categorias = require('../models/Categorias');

// Helper para tratamento de erros e redirecionamento
const handleErrorAndRedirect = (res, req, errorMessage, redirectPath, err) => {
    console.error("Erro:", err);
    req.flash("error_msg", errorMessage);
    res.redirect(redirectPath);
};

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
        handleErrorAndRedirect(res, req, "Houve um erro ao carregar as postagens.", "/404", err);
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
        handleErrorAndRedirect(res, req, "Houve um erro interno ao carregar a postagem.", "/", err);
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
        handleErrorAndRedirect(res, req, "Houve um erro interno ao listar as categorias.", "/", err);
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
        handleErrorAndRedirect(res, req, "Houve um erro interno ao carregar a página desta categoria.", "/", err);
    }
});

// Página de Erro 404
router.get("/404", (req, res) => {
    res.render("404");
});

module.exports = router;
