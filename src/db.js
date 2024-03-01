const { Client } = require('pg');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const refreshSecretKey = 'refresh-secret-key';
require('dotenv').config();

const db = new Client({
  connectionString: process.env.DB_URL
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
      return await db.query(this.createQuery,[username,password])
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteUser(username) {
    try {
      return await db.query(this.deleteQuery,[username])
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
    if ((user.username !== username) || (!await this.validateUser(password,user.password_hash))){
      throw new Error("Username does not match with password")
    }
  }
  async validateUser(password,hash){
    try{
    const test = await bcrypt.compare(password, hash)
    return test
  } catch(e) {
    throw new Error(e)
  }
  }
}


class TokenDatabase {
  constructor() {
  }

  async deleteToken(userId) {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE user_id = $1'
      return await db.query(query, [userId]);
    } catch (e) {
      throw new Error(e)
    }
  }

  async storeToken(refreshToken) {
    const decodedToken = jwt.decode(refreshToken)
    const userId = decodedToken.userId;
    const expirationDate = new Date(decodedToken.exp * 1000);
    if (await this.refreshTokenExists(userId)) {
      return this.replaceRefreshToken(userId,refreshToken,expirationDate)
    }
    return this.refreshTokenNewEntry(userId,refreshToken,expirationDate)
  }

  async replaceRefreshToken(userId,token,date){
    const updateQuery = 'UPDATE refresh_tokens SET token = $2, expire_date = $3 WHERE user_id = $1';
    const values = [userId, token,date];
    return await db.query(updateQuery, values);
  }

  async refreshTokenExists(userId){
    const fetchQuery =  'SELECT * FROM refresh_tokens WHERE user_id = $1';
    const entries = await db.query(fetchQuery,[userId])
    if (entries.rows.length===0){
      return false
    }
    return true
    }

  async refreshTokenNewEntry(userId,token,date){
   try {
    const query = 'INSERT INTO refresh_tokens(user_id, token, expire_date) VALUES($1, $2, $3)'
    return  await db.query(query, [userId,token,date]);
    } catch (err) {
      throw new Error(err)
    }
  }
  async fetchRefreshToken(userId){
   try {
     const fetchQuery =  'SELECT * FROM refresh_tokens WHERE user_id = $1';
     const entries = await db.query(fetchQuery,[userId])
     return entries.rows[0]
  } catch (err) {
    throw new Error(err)
  }
  }
}

const tokenDatabase = new TokenDatabase()

module.exports = {
  connectDB,
  UserDatabase,
  tokenDatabase
}