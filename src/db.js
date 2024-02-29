const { Client } = require('pg');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const refreshSecretKey = 'refresh-secret-key';

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

class UserDatabase {
  async createUser(username, password) {
    try {
      const query = 'INSERT INTO users(username, password_hash) VALUES($1, $2)';
      await db.query(query,[username,password])
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteUser(username) {
    try {
      const query = 'DELETE FROM users WHERE username = $1';
      await db.query(query,[username])
    } catch (e) {
      throw new Error(e);
    }
  }

  async fetchEntries(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      return await db.query(query,[username])
    } catch (err) {
      throw new Error(err);
    }
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

const deleteToken = async (userId) => {
  try {
    const query = 'DELETE FROM refresh_tokens WHERE user_id = $1'
    await db.query(query, [userId]);
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

const storeRefreshToken = async (refreshToken) => {
   try {
   const decoded = jwt.verify(refreshToken, refreshSecretKey);
    const userId = decoded.userId;
    const expirationDate = new Date(decoded.exp * 1000);
    const query = 'INSERT INTO refresh_tokens(user_id, token, expire_date) VALUES($1, $2, $3)'
    await db.query(query, [userId,refreshToken,expirationDate]);
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  connectDB,
  UserDatabase,
  createUser,
  isUserExists,
  isValidUser,
  deleteUser,
  fetchEntries,
  storeRefreshToken,
  deleteToken
}