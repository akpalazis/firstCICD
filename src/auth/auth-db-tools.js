const {db} = require("../db")
const bcrypt = require("bcryptjs")

class UserDatabase {
  constructor() {
    this.createQuery = 'INSERT INTO users(username, password_hash) VALUES($1, $2)';
    this.deleteQuery = 'DELETE FROM users WHERE username = $1';
    this.fetchQuery =  'SELECT * FROM users WHERE username = $1';
  }
  async createUser(credentials) {
    const username = credentials.username
    const password = credentials.password
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

  async isValidUser(credentials){
    const username = credentials.username
    const password = credentials.password
    const entries = await this.fetchEntries(username)
    if (entries.rows.length===0){
      throw new Error("Username not Found")
    }
    const user = entries.rows[0]
    if ((user.username !== username) || (!await this.validateUser(password,user.password_hash))){
      throw new Error("Username does not match with password")
    }
    return user.user_id
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

const userDatabaseTools = new UserDatabase()

module.exports = {userDatabaseTools}