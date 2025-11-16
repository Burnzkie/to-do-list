const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       
  password: '',      
  database: 'to_do_list'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL connected.');
});

module.exports = db;
