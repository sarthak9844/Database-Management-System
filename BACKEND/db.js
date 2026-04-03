const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'student',
    database: 'attendance_db'
});



db.connect((err) => {
    if (err) {
        console.log('Connection Failed');
        console.log(err);   // ADD THIS LINE
    } else {
        console.log('Connected to MySQL');
    }
});
module.exports = db;