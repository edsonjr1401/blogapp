const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const usuarios = require("./routes/usuarios");
const path = require("path");
const usuarios = require("./routes/usuarios")

// =======================================================================
// MÓDULOS E MODELOS (REQUIRES)
// =======================================================================
const Postagem = require('./models/Postagem');
const Categorias = require('./models/Categorias');
const session = require("express-session");
const flash = require("connect-flash");

// =======================================================================
// CONFIGURAÇÃO DE SESSÃO E FLASH (MIDDLEWARES GERAIS)
// =======================================================================
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// =======================================================================
// CONFIGURAÇÃO DO BODY-PARSER E HANDLEBARS
// =======================================================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        eq: function (a, b) {
            return a == b;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

// =======================================================================
// ROTAS DE ADMINISTRAÇÃO E USUÁRIOS
// =======================================================================
app.use('/admin', admin);
app.use("/usuarios", usuarios);

// =======================================================================
// ROTAS PÚBLICAS
// =======================================================================

// Rota Principal - Listagem de Postagens
app.get('/', async (req, res) => {
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

        res.render("index", { postagens: postagens });

    } catch (err) {
        console.error("Erro ao carregar postagens na rota /:", err);
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/404");
    }
});

// Rota de Postagem Individual
app.get("/postagem/:slug", async (req, res) => {
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
            res.render("postagem/index", { postagem: postagem })
        } else {
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/")
        }
    } catch (err) {
        console.error("Erro ao carregar postagem individual:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar a postagem.");
        res.redirect("/")
    }
});

// Rota de Listagem de Categorias
app.get("/categorias", async (req, res) => {
    try {
        const categorias = await Categorias.findAll({
            raw: true,
            order: [['nome', 'ASC']]
        });
        res.render("categorias/index", { categorias: categorias });
    } catch (err) {
        console.error("Erro ao listar categorias na rota /categorias:", err);
        req.flash("error_msg", "Houve um erro interno ao listar as categorias.");
        res.redirect("/");
    }
});

// Rota de Postagens por Categoria
app.get("/categorias/:slug", async (req, res) => {
    try {
        const categoria = await Categorias.findOne({
            where: { slug: req.params.slug },
            raw: true
        });

        if (categoria) {
            const postagens = await Postagem.findAll({
                where: { categoriaId: categoria.id },
                order: [['data', 'DESC']],
                raw: true,
                nest: true
            });

            res.render("categorias/postagens", {
                postagens: postagens,
                categoria: categoria
            });

        } else {
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/");
        }

    } catch (err) {
        console.error("Erro ao carregar a página da categoria:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.");
        res.redirect("/");
    }
});

// Rota de Erro 404
app.get("/404", (req, res) => {
    res.send('Erro 404!');
});

// =======================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================================
const PORT = 8089;
app.listen(PORT, function () {
    console.log("Servidor rodando na porta " + PORT);
});