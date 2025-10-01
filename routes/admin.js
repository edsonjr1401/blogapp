// routes/admin.js

const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");

// Rota principal do painel
router.get('/', (req, res) => {
    res.render("admin/index");
});

// Rota de posts
router.get('/posts', (req, res) => {
    res.send("Página de posts");
});

// Rota para listar todas as categorias
router.get("/categorias", (req, res) => { 
    Categoria.findAll({ order: [['nome', 'ASC']] })
        .then((categoriasEncontradas) => {
            // Converte os dados para um formato compatível com o Handlebars
            const categorias = categoriasEncontradas.map(cat => cat.get({ plain: true }));
            
            // Renderiza a view e passa os dados das categorias
            res.render("admin/categorias", { categorias: categorias });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias.");
            console.error("Erro ao buscar categorias:", err);
            res.redirect("/admin");
        });
});

// Rota para o formulário de adição de categoria
router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias");
});

// Rota para processar a criação de uma nova categoria
router.post('/categorias/nova', (req, res) => {
    const erros = [];

    // Validação dos campos
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
        // Cria a categoria no banco de dados
        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria.');
            res.redirect('/admin/categorias/add');
        });
    }
});

module.exports = router;