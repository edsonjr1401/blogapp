const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");
const Postagem = require("../models/Postagem");

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
    Categoria.findAll({ order: [['date', 'ASC']] })
        .then((categoriasEncontradas) => {
           
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

    router.get("/categorias/edit/:id", (req, res) => {
    const id = req.params.id;

    Categoria.findOne({ where: { id: id } })
        .then(categoria => {
            if (!categoria) {
                req.flash("error_msg", "Esta categoria não foi encontrada.");
                return res.redirect("/admin/categorias");
            }
            
            res.render("admin/editcategorias", { 
                categoria: categoria.get({ plain: true }) 
            });
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno ao buscar a categoria.");
            res.redirect("/admin/categorias");
        });
});

router.post("/categorias/edit", async (req, res) => {
    try {
        const categoriaParaEditar = await Categoria.findByPk(req.body.id);

        if (!categoriaParaEditar) {
            req.flash("error_msg", "Esta categoria não existe ou não foi encontrada.");
            return res.redirect("/admin/categorias");
        }

        categoriaParaEditar.nome = req.body.nome;
        categoriaParaEditar.slug = req.body.slug;

        await categoriaParaEditar.save();

        req.flash("success_msg", "Categoria editada com sucesso!");
        res.redirect("/admin/categorias");

    } catch (err) {
        console.error("Erro ao editar categoria:", err);
        req.flash("error_msg", "Houve um erro interno ao tentar editar a categoria.");
        res.redirect("/admin/categorias");
    }
});

router.post("/categorias/deletar", (req, res) => {
    Categoria.destroy({
        where: {
            id: req.body.id
        }
        }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})


router.get("/postagens", (req, res) => {

    Postagem.findAll({
       include: [{ model: Categoria }],
       order: [['data', 'DESC']],
       raw: true,
       nest: true
    }).then((postagens) => {
        //const postagensLimpa = postagens.map(post => post.get ({ plain: true}))
        res.render("admin/postagens", { postagens: postagens })    
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
        
})

router.get("/postagens/add", (req, res) => {
    Categoria.findAll({ raw: true }) 
        .then((categorias) => {
            res.render("admin/addpostagem", {categorias: categorias})
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao buscar as categorias")
            res.redirect("/admin")
        })
})


router.post("/postagens/nova", (req, res) => {

    console.log("===== DADOS DO FORMULÁRIO =====")
    console.log(req.body)

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
            data: new Date() 
        }

        console.log("===== DADOS PARA SALVAR =====")
        console.log(novaPostagem)
        console.log("===== TIPO DA DATA =====")
        console.log(typeof novaPostagem.data)
        console.log(novaPostagem.data)

        Postagem.create(novaPostagem)
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!")
                res.redirect("/admin/postagens")
            })
            .catch((err) => {
                console.log("===== ERRO COMPLETO =====")
                console.log(err)
                req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
                res.redirect("/admin/postagens")
            })
    }
})

router.get("/postagens/edit/:id", (req, res) =>{

    Postagem.findOne({id: req.params.id}).then((postagem) => {
       
        Categoria.findAll().then((categorias) => {

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("err_msg", "Houve um erro ao carregar o fomulario de edição")
        req.redirect("/admin/postagens")
    })

    res.render("admin/editpostagens")

})


    

module.exports = router;


