const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");

router.get('/', (req, res) => {
    res.render("admin/index");
});

router.get('/posts', (req, res) =>{
    res.send("Página de posts");
});

router.get("/categorias", (req, res) => { 
    res.render("admin/categorias");
});

router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias");
});




router.post('/categorias/nova', (req, res) => {

var erros = []

if(!req.body.nome || typeof req.body.name == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
}

if (!req.body.slug || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Slug inválido"})
}

if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria é muito pequeno"})
}

if(erros.length > 0){
    res.render("addcategorias", {erros: erros})
}

    Categoria.create({
        nome: req.body.nome,
        slug: req.body.slug
    }).then(() => {
        console.log("SUCESSO: Categoria salva no banco.");
        
        // MENSAGEM PARA O USUÁRIO (com flash)
        req.flash('success_msg', 'Categoria criada com sucesso!');
        
        // Redirecionamento limpo, sem parâmetros na URL
        res.redirect('/admin/categorias');
    }).catch((err) => {
        console.log("ERRO: Falha ao salvar categoria. Erro: " + err);

        req.flash('error_msg', 'Houve um erro ao salvar a categoria.');
        res.redirect('/admin/categorias/add');
    });
});

router.get("/teste", (req, res) => {
    res.send("Isso é um teste");
});

module.exports = router;