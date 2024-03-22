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

async function isRoleValid(role){
  if(role==="NO"){
    return false
  }
  return true
}

async function updateUserRole(username, id, role) {
  let sqlQuery = `UPDATE users SET role = $1 WHERE`;
  const params = [];

  // Add conditions to the SQL query for each provided parameter
  if (role) {
    await isRoleValid(role)
      .then((result) => {
        if (result) {
          params.push(role);
        }else{
          throw new Error("Role is not valid.")
        }
      })
      .catch((err)=>{
        return Promise.reject(err)
      })
  } else {
    return Promise.reject(new Error('No role provided.'));
  }

  if (username) {
    sqlQuery += ' username = $' + (params.length + 1);
    params.push(username);
  }

  if (id) {
    if (params.length > 1) {
      sqlQuery += ' AND';
    }
    sqlQuery += ' user_id = $' + (params.length + 1);
    params.push(id);
  }
  return new Promise((resolve, reject) => {
    if (params.length === 1) {
      reject(new Error('No parameters provided for update.'));
    } else {
      db.query(sqlQuery, params, (err, results) => {
        if (err) {
          reject(new Error('QB error'));
        } else {
          if (results.rowCount > 0) {
            resolve(true); // Send the number of rows affected
          }
          reject(new Error('Invalid parameters.'))
          }
      });
    }
  });
}


module.exports={fetchQuery,updateUserRole,isRoleValid}