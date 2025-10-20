const express = require('express');
const router = express.Router();
// Importação dos modelos.
const Categorias = require('../models/Categorias');
const Postagem = require('../models/Postagem');
const {eAdmin} = require("../helpers/eAdmin")

// =======================================================================
// ROTA PRINCIPAL DO ADMIN (GET /admin)
// =======================================================================
router.get('/', eAdmin, (req, res) => {
    res.render("admin/index");
});

// =======================================================================
// ROTAS DE CATEGORIAS: LISTAGEM (GET /admin/categorias)
// =======================================================================
router.get('/categorias', eAdmin, async (req, res) => {
    try {
        const categorias = await Categorias.findAll({
            raw: true,
            nest: true,
            order: [['date', 'DESC']]
        });

        const categoriasFormatadas = categorias.map(cat => {
            // Converte strings de data para objeto Date e depois formata
            if (cat.date) {
                cat.date = new Date(cat.date).toLocaleDateString('pt-BR');
            }
            if (cat.createdAt) {
                cat.createdAt = new Date(cat.createdAt).toLocaleDateString('pt-BR');
            }
            if (cat.updatedAt) {
                cat.updatedAt = new Date(cat.updatedAt).toLocaleDateString('pt-BR');
            }
            return cat;
        });

        res.render("admin/categorias", { categorias: categoriasFormatadas });

    } catch (err) {
        console.error("Erro ao listar categorias:", err);
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    }
});

// =======================================================================
// ROTAS DE CATEGORIAS: ADICIONAR (GET /admin/categorias/add)
// =======================================================================
router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategorias");
});

// =======================================================================
// ROTAS DE CATEGORIAS: SALVAR NOVA (POST /admin/categorias/nova)
// =======================================================================
router.post('/categorias/nova', eAdmin, async (req, res) => {
    const erros = [];

    if (!req.body.nome || req.body.nome == null) {
        erros.push({ texto: "Nome da categoria inválido." });
    }
    if (!req.body.slug || req.body.slug == null) {
        erros.push({ texto: "Slug da categoria inválido." });
    }

    if (erros.length > 0) {
        req.flash("error_msg", "Erro ao salvar: Verifique os dados.");
        return res.redirect("/admin/categorias/add");
    }

    try {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };

        await Categorias.create(novaCategoria);

        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");

    } catch (err) {
        console.error("Erro ao salvar nova categoria:", err);
        req.flash("error_msg", "Houve um erro interno ao salvar a categoria.");
        res.redirect("/admin/categorias/add");
    }
});

// =======================================================================
// ROTAS DE CATEGORIAS: EDITAR (GET /admin/categorias/edit/:id)
// =======================================================================
router.get('/categorias/edit/:id', eAdmin, async (req, res) => {
    try {
        // 1. Busca a categoria específica pelo ID
        const categoria = await Categorias.findByPk(req.params.id, {
            raw: true // Essencial para o Handlebars
        });

        if (!categoria) {
            req.flash("error_msg", "Categoria não encontrada.");
            return res.redirect("/admin/categorias");
        }

        // 2. Renderiza a view de edição, passando os dados
        res.render("admin/editcategorias", {
            categoria: categoria
        });

    } catch (err) {
        console.error("Erro ao carregar formulário de edição de categoria:", err);
        req.flash("error_msg", "Erro ao carregar dados para edição.");
        res.redirect("/admin/categorias");
    }
});

// =======================================================================
// ROTAS DE CATEGORIAS: SALVAR EDIÇÃO (POST /admin/categorias/edit)
// =======================================================================
router.post('/categorias/edit', eAdmin, async (req, res) => {
    // 1. Validação
    const erros = [];

    if (!req.body.nome || req.body.nome == null) {
        erros.push({ texto: "Nome da categoria inválido." });
    }
    if (!req.body.slug || req.body.slug == null) {
        erros.push({ texto: "Slug da categoria inválido." });
    }

    // O ID da categoria deve ser passado via campo oculto no formulário
    const idCategoria = req.body.id;

    if (erros.length > 0) {
        // Se houver erros, redireciona para a página de edição atual
        req.flash("error_msg", "Erro ao salvar: Verifique os dados.");
        return res.redirect("/admin/categorias/edit/" + idCategoria);
    }

    try {
        // 2. Busca o registro pelo ID
        const categoria = await Categorias.findByPk(idCategoria);

        if (!categoria) {
            req.flash("error_msg", "Categoria não encontrada para atualização.");
            return res.redirect("/admin/categorias");
        }

        // 3. Atualiza os campos
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        // 4. Salva no banco de dados
        await categoria.save();

        req.flash("success_msg", "Categoria editada com sucesso!");
        res.redirect("/admin/categorias");

    } catch (err) {
        console.error("Erro ao salvar edição de categoria:", err);
        req.flash("error_msg", "Houve um erro interno ao salvar a edição.");
        res.redirect("/admin/categorias/edit/" + idCategoria);
    }
});

// =======================================================================
// ROTAS DE CATEGORIAS: DELETAR (POST /admin/categorias/deletar)
// =======================================================================
router.post('/categorias/deletar', eAdmin, async (req, res) => {
    try {
        const idCategoria = req.body.id;

        if (!idCategoria) {
            req.flash("error_msg", "ID da categoria não fornecido.");
            return res.redirect("/admin/categorias");
        }

        // 1. Usa o método destroy() do Sequelize para deletar pelo ID
        const linhasDeletadas = await Categorias.destroy({
            where: { id: idCategoria }
        });

        if (linhasDeletadas === 0) {
            req.flash("error_msg", "Categoria não encontrada para deleção.");
        } else {
            req.flash("success_msg", "Categoria deletada com sucesso!");
        }

        // 2. Redireciona de volta para a lista de categorias
        res.redirect("/admin/categorias");

    } catch (err) {
        console.error("Erro ao deletar categoria:", err);
        // TRATAMENTO: Adicionamos um tratamento específico caso a categoria esteja em uso
        // O erro (SQL Foreign Key Constraint) aparecerá aqui se houver postagens nela.
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            req.flash("error_msg", "Não é possível deletar esta categoria. Existem postagens ligadas a ela.");
        } else {
            req.flash("error_msg", "Houve um erro ao tentar deletar a categoria.");
        }
        res.redirect("/admin/categorias");
    }
});


// =======================================================================
// ROTAS DE POSTAGENS: LISTAGEM (GET /admin/postagens)
// =======================================================================
router.get("/postagens", eAdmin, async (req, res) => {
    try {
        const postagens = await Postagem.findAll({
            include: [{ model: Categorias, as: 'categorias' }],
            order: [['data', 'DESC']],
            raw: true,
            nest: true
        });

        res.render("admin/postagens", { postagens });
    } catch (err) {
        console.error("Erro ao listar postagens:", err);
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
    }
});


// =======================================================================
// ROTAS DE POSTAGENS: ADICIONAR (GET /admin/postagens/add)
// =======================================================================
router.get('/postagens/add', eAdmin, async (req, res) => {
    try {
        // Busca todas as categorias para preencher o campo <select> do formulário
        const categorias = await Categorias.findAll({
            raw: true,
            order: [['nome', 'ASC']]
        });

        res.render("admin/addpostagem", { categorias: categorias });

    } catch (err) {
        console.error("Erro ao carregar formulário de nova postagem:", err);
        req.flash("error_msg", "Houve um erro ao carregar o formulário.");
        res.redirect("/admin/postagens");
    }
});

// =======================================================================
// ROTAS DE POSTAGENS: SALVAR NOVA (POST /admin/postagens/nova)
// =======================================================================
router.post('/postagens/nova', eAdmin, async (req, res) => {
    // Validação
    const erros = [];

    if (!req.body.titulo || req.body.titulo == null) {
        erros.push({ texto: "Título inválido." });
    }
    if (!req.body.slug || req.body.slug == null) {
        erros.push({ texto: "Slug inválido." });
    }

    if (!req.body.categoria || req.body.categoria.length === 0) {
        erros.push({ texto: "A categoria é obrigatória. Selecione uma." });
    }

    if (erros.length > 0) {
        req.flash("error_msg", "Erro ao salvar: " + erros.map(e => e.texto).join(', '));
        return res.redirect("/admin/postagens/add");
    }

    try {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            data: new Date(),
            categoriaId: req.body.categoria
        };

        await Postagem.create(novaPostagem);

        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");

    } catch (err) {
        console.error("Erro ao salvar nova postagem:", err);
        req.flash("error_msg", "Houve um erro interno ao salvar a postagem.");
        res.redirect("/admin/postagens/add");
    }
});

// =======================================================================
// ROTAS DE POSTAGENS: EDITAR (GET /admin/postagens/edit/:id)
// =======================================================================
router.get('/postagens/edit/:id', eAdmin, async (req, res) => {
    try {
        const postagem = await Postagem.findByPk(req.params.id, {
            raw: true
        });

        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada.");
            return res.redirect("/admin/postagens");
        }

        const categorias = await Categorias.findAll({
            raw: true,
            order: [['nome', 'ASC']]
        });

        res.render("admin/editpostagens", {
            postagem: postagem,
            categorias: categorias
        });

    } catch (err) {
        console.error("Erro ao carregar formulário de edição:", err);
        req.flash("error_msg", "Erro ao carregar dados para edição.");
        res.redirect("/admin/postagens");
    }
});
// routes/admin.js (ADICIONE ESTE BLOCO)

// =======================================================================
// ROTAS DE POSTAGENS: SALVAR EDIÇÃO (POST /admin/postagens/edit)
// =======================================================================
router.post('/postagens/edit', eAdmin, async (req, res) => {
    // O ID da postagem vem do campo oculto no formulário
    const idPostagem = req.body.id;
    const erros = [];

    // Validação básica (Você pode expandir esta seção)
    if (!req.body.titulo || req.body.titulo == null) {
        erros.push({ texto: "Título inválido." });
    }
    if (!req.body.slug || req.body.slug == null) {
        erros.push({ texto: "Slug inválido." });
    }
    if (!req.body.categoria || req.body.categoria.length === 0) {
        erros.push({ texto: "A categoria é obrigatória. Selecione uma." });
    }

    if (erros.length > 0) {
        // Se houver erros, redirecionamos de volta para a edição (GET /edit/:id)
        req.flash("error_msg", "Erro ao salvar: Verifique os dados.");
        return res.redirect("/admin/postagens/edit/" + idPostagem);
    }

    try {
        // 1. Busca a postagem pelo ID
        const postagem = await Postagem.findByPk(idPostagem);

        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada para atualização.");
            return res.redirect("/admin/postagens");
        }

        // 2. Atualiza os campos
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoriaId = req.body.categoria;

        // 3. Salva no banco de dados
        await postagem.save();

        req.flash("success_msg", "Postagem editada com sucesso!");
        res.redirect("/admin/postagens");

    } catch (err) {
        console.error("Erro ao salvar edição da postagem:", err);
        req.flash("error_msg", "Houve um erro interno ao salvar a edição.");
        res.redirect("/admin/postagens/edit/" + idPostagem); // Redireciona de volta em caso de falha no banco
    }
});

// =======================================================================
// ROTAS DE POSTAGENS: DELETAR (POST /admin/postagens/deletar)
// =======================================================================
router.post('/postagens/deletar', eAdmin,  async (req, res) => {
    try {
        const idPostagem = req.body.id;

        if (!idPostagem) {
            req.flash("error_msg", "ID da postagem não fornecido.");
            return res.redirect("/admin/postagens");
        }

        const linhasDeletadas = await Postagem.destroy({
            where: { id: idPostagem }
        });

        if (linhasDeletadas === 0) {
            req.flash("error_msg", "Postagem não encontrada para deleção.");
        } else {
            req.flash("success_msg", "Postagem deletada com sucesso!");
        }

        res.redirect("/admin/postagens");

    } catch (err) {
        console.error("Erro ao deletar postagem:", err);
        req.flash("error_msg", "Houve um erro ao tentar deletar a postagem.");
        res.redirect("/admin/postagens");
    }
});

module.exports = router;