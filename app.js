const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const Postagem = require('./models/Postagem');
const Categorias = require('./models/Categorias');
const session = require("express-session");
const flash = require("connect-flash");

app.use(session({
  secret: "cursodenode",
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "public")));

app.use('/admin', admin);

app.get('/', async (req, res) => {
  try {
    const postagens = await Postagem.findAll({
      include: [{
        model: Categorias,
        as: 'categorias', // mesmo alias definido no modelo!
        attributes: ['nome'] // apenas o nome da categoria
      }],
      order: [['data', 'DESC']]
    })

    const postagensFormatadas = postagens.map(p => p.toJSON());
    res.render("index", { postagens: postagensFormatadas });
  } catch (error) {
    console.error("Erro ao carregar postagens:", err);
    req.flash("error_msg", "Houve um erro ao carregar as postagens.");
    res.redirect("/404");
  }
});

app.get("/404", (req, res) => {
  res.send('Erro 404!');
});

const PORT = 8089;
app.listen(PORT, function () {
  console.log("Servidor rodando na porta " + PORT);
});
