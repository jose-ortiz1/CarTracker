const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'car_tracker'
})

connection.connect((error) => {
    if (error) console.log(error);
    else console.log(`Connected to database: ${connection.config.database}`);
})

module.exports = connection;