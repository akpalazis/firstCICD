const {stripToken} = require("./tokens/token-tools")
const {AUTH_SECRET_KEY} = require("./constants")
const jwt = require('jsonwebtoken');
const {mongo} = require("./db")

//TODO: add another user and tests. Make a platform to change the urls of the role change the function isRoleValid
async function roleManager(req, res, next) {
  try{
    const tokens = req.headers.authorization
    const [accessTokenCookie,refreshTokenCookie] = tokens.split(',');
    const accessToken = stripToken(accessTokenCookie)
    const accessData = jwt.decode(accessToken,AUTH_SECRET_KEY)
    const mongo_db = mongo.db("admin")
    const collections = mongo_db.collection("permissions")
    const role = accessData.role
    const result = await collections.findOne({ role:role });
    const isValid = result.urls.includes(req.url)
    if(isValid){
      return next()
    }
    res.status(400).send("Access Denied. No Permission.")
  }catch (e) {
    console.log(e)
  }
}

module.exports = {roleManager}