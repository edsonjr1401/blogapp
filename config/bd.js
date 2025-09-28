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