const { Client } = require('pg');
const {DB_URL} = require("./constants")

const db = new Client({
  connectionString: DB_URL
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