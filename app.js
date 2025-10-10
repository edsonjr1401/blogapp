const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");

// =======================================================================
// MÓDULOS (REQUIRES)
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

// Configuração do Handlebars com helpers personalizados
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

// Configuração de arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "public")));

// =======================================================================
// ROTAS E CHAMADAS DE FUNÇÃO
// =======================================================================

// Rota de Administração
app.use('/admin', admin);

// Rota Principal (RAIZ) - Listagem de Postagens
app.get('/', async (req, res) => {
    try {
        const postagens = await Postagem.findAll({
            // Inclui a Categoria usando o alias consistente 'categorias'
            include: [{
                model: Categorias,
                as: 'categorias',
                attributes: ['nome']
            }],
            // Usa raw e nest para evitar erros do Handlebars e organizar dados
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