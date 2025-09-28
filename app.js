// Carregando módulo
    const express = require('express')
    const { engine } = require('express-handlebars')
    const bodyParser = require("body-parser")
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
     // const mysql = require('mysql2/promise') // REMOVA ESTA LINHA


// Configurações 
     // Body Parser
     app.use(bodyParser.urlencoded({extended: true}))
     app.use(bodyParser.json())

    // Handlebars 
     app.engine('handlebars', engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars');

/*
* REMOVER TODO O BLOCO DE CÓDIGO ABAIXO (DAQUI...)
*/
/*
      // MySQL - Pool de Conexões
        const db = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '6863',
            database: 'blogapp',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Testar conexão
        db.getConnection()
            .then((connection) => {
                console.log("Conectado ao MySQL")
                connection.release()
            })
            .catch((err) => {
                console.log("Erro ao conectar: " + err)
            })

        // Disponibilizar conexão globalmente
        app.locals.db = db;
*/
/*
* (...ATÉ AQUI)
*/


    // Public
    app.use(express.static(path.join(__dirname,"public")))

// Rotas 
     app.use('/admin', admin)

// Outros
const PORT = 8081
app.listen(PORT, function() {
 console.log("Servidor rodando!")
})