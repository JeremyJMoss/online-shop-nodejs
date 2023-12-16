const mysql = require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'jeremy',
    database: 'node_shop',
    password: 'JJOP&Wus5'
})

module.exports = pool.promise();