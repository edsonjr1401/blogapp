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
const main = require("./routes/main");

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

app.use('/', main);

// =======================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================================
const PORT = process.env.PORT || 8089;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
});

module.exports = app;