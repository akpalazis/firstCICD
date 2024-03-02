const { Client } = require('pg');
const jwt = require('jsonwebtoken');
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

class TokenDatabase {
  constructor() {
  }

  async deleteToken(userId) {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE user_id = $1'
      await db.query(query, [userId])
      return true
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async storeToken(refreshToken) {
    try {
    const decodedToken = jwt.decode(refreshToken);
    const userId = decodedToken.userId;
    const expirationDate = new Date(decodedToken.exp * 1000);
    if (await this.refreshTokenExists(userId)) {
      if (await this.replaceRefreshToken(userId, refreshToken, expirationDate)) {
        return true;
      }
    }
    return  !!(await this.refreshTokenNewEntry(userId, refreshToken, expirationDate));
  } catch (error) {
    throw new Error(error);
  }
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
    await db.query(query, [userId,token,date]);
    return true
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
  db,
  connectDB,
  tokenDatabase
}