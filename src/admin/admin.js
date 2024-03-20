const express = require('express');
const adminRouter = express.Router();
const {db} = require("../db")

adminRouter.get('/admin/users', async (req,res)=>
  {
    let sqlQuery = 'SELECT * FROM users WHERE';
    const params = [];
    let n = 0;
    // Add conditions to the SQL query for each provided parameter
  if (req.query.username) {
    n = params.length
    if (n>0){
      sqlQuery += ' AND';
    }
    sqlQuery += ' username = $' + (n+1);
    params.push(req.query.username);
  }
  if (req.query.id) {
    n = params.length
    if (n>0){
      sqlQuery += ' AND';
    }
    sqlQuery += ' user_id = $' + (n+1);
    params.push(req.query.id);
  }
    // Execute the SQL query with the built query and parameters
    console.log(sqlQuery)
    db.query(sqlQuery, params, (err, results) => {
    if (err) {
      res.status(400).send('Query is not Valid');
      return;
    }
    res.json(results.rows); // Send the fetched users as JSON response
  });
  }
)


module.exports = {adminRouter}


