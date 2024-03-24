const { Client } = require('pg');
const {DB_URL,MONGO_URL} = require("./constants")
const { MongoClient } = require('mongodb');

const db = new Client({
  connectionString: DB_URL
});

const mongo = new MongoClient(MONGO_URL)
async function connectDB() {
  try {
    await db.connect();
    await mongo.connect();
  } catch (err) {
    throw err;
  }
}

module.exports = {
  db,
  mongo,
  connectDB,
}