// Carregando módulo
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");

// 1. Importar os novos módulos
const session = require("express-session");
const flash = require("connect-flash");

// Configurações 
    // 2. Configurar a Sessão (ESSENCIAL PARA O FLASH)
    app.use(session({
        secret: "chavesecretaparaoprojeto", // Troque por uma chave mais segura
        resave: true,
        saveUninitialized: true
    }));
    // 3. Iniciar o Flash
    app.use(flash());

    // 4. Criar o Middleware de mensagens
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
    app.use('/admin', admin);

// Outros
const PORT = 8081;
app.listen(PORT, function() {
    console.log("Servidor rodando!");
});