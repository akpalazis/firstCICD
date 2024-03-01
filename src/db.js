const { Client } = require('pg');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const refreshSecretKey = 'refresh-secret-key';

const db = new Client({
  connectionString: "postgres://postgres:pass@192.168.1.182:5433/postgres"
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
  constructor() {
    this.createQuery = 'INSERT INTO users(username, password_hash) VALUES($1, $2)';
    this.deleteQuery = 'DELETE FROM users WHERE username = $1';
    this.fetchQuery =  'SELECT * FROM users WHERE username = $1';
  }
  async createUser(username, password) {
    try {
      await db.query(this.createQuery,[username,password])
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteUser(username) {
    try {
      await db.query(this.deleteQuery,[username])
    } catch (e) {
      throw new Error(e);
    }
  }

  async fetchEntries(username) {
    try {
      return await db.query(this.fetchQuery,[username])
    } catch (err) {
      throw new Error(err);
    }
  }

  async canDelete(username){
  const entries = await this.fetchEntries(username)
    if(entries.rows.length===0){
      throw new Error("Username not Found")
    }
  }

  async isUserExists(username){
    const entries = await this.fetchEntries(username)
    if(entries.rows.length>0){
      throw new Error("User Already Exists")
    }
  }

  async isValidUser(username,password){
    const entries = await this.fetchEntries(username)
    if (entries.rows.length===0){
      throw new Error("Username not Found")
    }
    const user = entries.rows[0]
    if ((user.username !== username) || (!await validateUser(password,user.password_hash))){
      throw new Error("Username does not match with password")
    }
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


const fetchRefreshToken = async (userId) => {
   try {
     const fetchQuery =  'SELECT * FROM refresh_tokens WHERE user_id = $1';
     const entries = await db.query(fetchQuery,[userId])
     return entries.rows[0]
  } catch (err) {
    throw new Error(err)
  }
}

// TODO: create class for RefreshToken create,replace,delete

module.exports = {
  connectDB,
  UserDatabase,
  storeRefreshToken,
  fetchRefreshToken,
  deleteToken
}