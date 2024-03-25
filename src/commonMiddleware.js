const axios = require("axios")

const {SERVER_SECRET_KEY} = require("./constants")

const {stripToken} = require("./tokens/token-tools")
const {AUTH_SECRET_KEY} = require("./constants")
const jwt = require('jsonwebtoken');
const {mongo} = require("./db")

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

function storeTokens(req,res,next){
  if (res.locals.newTokens){
    try {
      res.cookie('accessToken', res.locals.tokens.access, {httpOnly: true, secure: false, sameSite: 'strict'});
      res.cookie('refreshToken', res.locals.tokens.refresh, {httpOnly: true, secure: false, sameSite: 'strict'});
      res.locals.tokens = null
    } catch (e){
      console.log(e)
      return res.status(500).send("Internal server error")
    }
  }
  next()
}

async function validateTokenMiddleware(req,res,next){
  const serverToken = jwt.sign({serverId:"auth-login"}, SERVER_SECRET_KEY, { expiresIn: "10s" });
  return await axios.post('http://token:3000/validate-token',null,
    {
      headers:{
        Authorization:req.headers.authorization,
        serverToken:serverToken
      }})
    .then((response) => {
      res.locals.newTokens = false
      if ((response.status === 200) && (response.data.message === "Token is Valid")){
        if (response.data.tokens){
          res.locals.tokens = response.data.tokens
          res.locals.newTokens = true
        }
      }
      return next()
    })
    .catch(error => {
      return res.status(400).send(error.response.data);
    });
}

function allowLoginUsersMiddleware(registerer){
  return function (req,res,next) {
    const tokens = req.headers.authorization;
    if ((tokens && registerer) || (!tokens && !registerer)){
      return next()
    }
    return res.status(400).send("Unauthorized access")
  }
}

module.exports = {roleManager,storeTokens,validateTokenMiddleware,allowLoginUsersMiddleware}