const { Client } = require('pg');
const {DB_URL} = require("./constants")

const db = new Client({
  connectionString: DB_URL
});

async function connectDB() {
  try {
    await db.connect();
  } catch (err) {
    throw err;
  }
}

module.exports = {
  db,
  connectDB,
}