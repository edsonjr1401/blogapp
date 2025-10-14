const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const usuarios = require("./routes/usuarios");


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
// Configuração da sessão
app.use(session({
    secret: "cursodenode", 
    resave: true, 
    saveUninitialized: true 
}));

// Inicialização do Flash (mensagens temporárias)
app.use(flash());

// Middleware para variáveis locais (acessíveis em todas as views)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg"); // Mensagens de sucesso
    res.locals.error_msg = req.flash("error_msg");   // Mensagens de erro padrão
    res.locals.error = req.flash("error");           // Erros de autenticação, etc.
    next();
});

// =======================================================================
// CONFIGURAÇÃO DO BODY-PARSER E HANDLEBARS
// =======================================================================
// Configuração para processar dados de formulário
app.use(bodyParser.urlencoded({ extended: true }));
// Configuração para processar JSON
app.use(bodyParser.json());

// Configuração do Handlebars com helpers personalizados
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        // Helper de comparação 'eq'
        eq: function (a, b) {
            return a == b;
        }
    }
}));
app.set('view engine', 'handlebars');
// Fixa o diretório de views para o caminho absoluto
app.set('views', path.join(__dirname, 'views'));

// Configuração de arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "public")));

// =======================================================================
// ROTAS DE ADMINISTRAÇÃO E VISUALIZAÇÃO PÚBLICA
// =======================================================================

// Rota de Administração (Carrega o módulo de rotas de admin)
app.use('/admin', admin);

// Rota Principal (RAIZ) - Listagem de Postagens
app.get('/', async (req, res) => {
    try {
        const postagens = await Postagem.findAll({
            // Inclui a Categoria usando o alias 'categorias'
            include: [{
                model: Categorias,
                as: 'categorias',
                attributes: ['nome']
            }],
            raw: true,
            nest: true,
            order: [['data', 'DESC']]
        });

        // Retorna a view principal
        res.render("index", { postagens: postagens });

    } catch (err) {
        console.error("Erro ao carregar postagens na rota /:", err);
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/404");
    }
});

// Rota de Postagem Individual (Visualiza o conteúdo completo)
app.get("/postagem/:slug", async (req, res) => {
    try {
        // Busca a postagem usando o slug como critério (where: { slug: ... })
        const postagem = await Postagem.findOne({
            where: { slug: req.params.slug },
            // Inclui a categoria
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

app.get("/categorias/:slug", (req, res) => {
    Categorias.findOne({slug: req.params.slug}).then((categorias) => {
        if(categorias){
            Postagem.find({categoria: categoria._id}).then((postagens) => {

                res.render("/categorias/postagens", {postagens: postagens, categorias: categorias})

            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts!")
            })

        }else{
            req.flash("error_msg", "Essa categoria não exite")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve im erro interno ao carregar a página desta categoria")
        req.redirect("/")
    })
})

app.use('/admin', admin)
app.use("/usuarios", usuarios);

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