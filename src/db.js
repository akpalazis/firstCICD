const { Client } = require('pg');
const bcrypt = require("bcryptjs")

const db = new Client({
  connectionString: 'postgres://postgres:pass@192.168.1.182:5433/postgres',
});

async function connectDB() {
  try {
    await db.connect();
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Error connecting to PostgreSQL database', err);
    throw err;
  }
}

const createUser = async (username,password) => {
  try {
    const query = 'INSERT INTO users(username, password_hash) VALUES($1, $2)'
    await db.query(query, [username, password]);
  } catch (err) {
    throw new Error(err)
  }
}

const fetchEntries = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1'
  return  await db.query(query, [username])
}

const isUserExists = async (username) =>{
    const entries = await fetchEntries(username)
    if(entries.rows.length>0){
      throw new Error("User Already Exists")
    }
}

const isValidUser = async (username,password) => {
  const entries = await fetchEntries(username)
  if (entries.rows.length===0){
    throw new Error("Username not Found")
  }
  const user = entries.rows[0]
  if ((user.username !== username) || (!await validateUser(password,user.password_hash))){
    throw new Error("Username does not match with password")
  }
}

const deleteUser = async (username) => {
  try {
    const query = 'DELETE FROM users WHERE username = $1'
    await db.query(query, [username]);
  } catch (e) {
    throw new Error(e)
  }
}
const validateUser = async (password,hash)=> {
  try{
    const test = await bcrypt.compare(password, hash)
    return test
  } catch(e) {
    throw new Error(e)
  }
}

module.exports = {
  connectDB,
  createUser,
  isUserExists,
  isValidUser,
  deleteUser,
  fetchEntries
}