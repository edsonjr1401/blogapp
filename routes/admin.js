const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");

router.get('/', (req, res) => {
    res.render("admin/index");
});

router.get('/posts', (req, res) => {
    res.send("Página de posts");
});

router.get("/categorias", (req, res) => { 
    res.render("admin/categorias");
});

router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias");
});

router.post('/categorias/nova', (req, res) => {
    const erros = [];

    if (!req.body.nome || req.body.nome.trim() === "") {
        erros.push({ texto: "Nome inválido" });
    } 
    
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno" });
    }

    if (!req.body.slug || req.body.slug.trim() === "") {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros });
    } else {
        // Se não houver erros, tenta criar a categoria no banco de dados
        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente.');
            res.redirect('/admin/categorias/add');
        });
    }
});

router.get("/teste", (req, res) => {
    res.send("Isso é um teste");
});

module.exports = router;