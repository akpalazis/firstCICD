const { Client } = require('pg');
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

module.exports = {
  db,
  connectDB,
}