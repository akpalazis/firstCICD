const {db} = require("../db")

async function fetchQuery(username,id) {
  let sqlQuery = 'SELECT * FROM users WHERE';
  const params = [];
  let n = 0;
  // Add conditions to the SQL query for each provided parameter
  if (username) {
    n = params.length
    if (n > 0) {
      sqlQuery += ' AND';
    }
    sqlQuery += ' username = $' + (n + 1);
    params.push(username);
  }
  if (id) {
    n = params.length
    if (n > 0) {
      sqlQuery += ' AND';
    }
    sqlQuery += ' user_id = $' + (n + 1);
    params.push(id);
  }
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, params, (err, results) => {
      if (err) {
        reject()
      }
      resolve(results.rows) // Send the fetched users as JSON response
    });
  })
}

module.exports={fetchQuery}