const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const Postagem = require("./models/Postagem");

// Importar os novos módulos
const session = require("express-session");
const flash = require("connect-flash");

// Configurações 
   
    app.use(session({
        secret: "cursodenode", 
        resave: true,
        saveUninitialized: true
    }));
    // Iniciar o Flash
    app.use(flash());

    // Criar o Middleware de mensagens
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next();
    });

    // Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // Handlebars 
    app.engine('handlebars', engine({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');

    // Public
    app.use(express.static(path.join(__dirname,"public")));

// Rotas 
    app.get('/', (req, res) => {
        Postagem.findAll({
            include: [{
                model: Categoria,
                as: 'categoria' 
            }],
            order: [['data', 'DESC']]
        }).then((postagens) => {
            res.render("index", { postagens: postagens })
        }).catch((err) => { 
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/404", (req, res) =>{
        res.send('Erro 404!')
    })


    app.use('/admin', admin);

// Outros
const PORT = 8089;
app.listen(PORT, function() {
    console.log("Servidor rodando!");
});