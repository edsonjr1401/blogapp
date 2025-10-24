// =======================================================================
// IMPORTAÇÕES
// =======================================================================
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");

// Rotas
const admin = require("./routes/admin");
const usuarios = require("./routes/usuarios");

// Modelos
const Postagem = require('./models/Postagem');
const Categorias = require('./models/Categorias');

// =======================================================================
// INICIALIZAÇÃO DO APP
// =======================================================================
const app = express();

// Configuração do Passport
require("./config/auth")(passport);

// =======================================================================
// MIDDLEWARES
// =======================================================================

// Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));

// Flash Messages
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Variáveis Globais
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    
    // Disponibiliza usuário autenticado
    if (req.user) {
        res.locals.user = req.user.toJSON ? req.user.toJSON() : { ...req.user };
    } else {
        res.locals.user = null;
    }
    
    next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a == b
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Arquivos Estáticos
app.use(express.static(path.join(__dirname, "public")));

// =======================================================================
// ROTAS
// =======================================================================

// Rotas de Administração e Usuários
app.use('/admin', admin);
app.use("/usuarios", usuarios);

// --- ROTAS PÚBLICAS ---

// Página Inicial - Listagem de Postagens
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

        res.render("index", { postagens });

    } catch (err) {
        console.error("Erro ao carregar postagens:", err);
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/404");
    }
});

// Postagem Individual
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
app.get("/categorias", async (req, res) => {
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
app.get("/categorias/:slug", async (req, res) => {
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
app.get("/404", (req, res) => {
    res.render("404"); // ou res.status(404).send('Erro 404!');
});

// =======================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================================
const PORT = process.env.PORT || 8089;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
});

module.exports = app;