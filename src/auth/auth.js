const express = require('express');
const authRouter = express.Router();
const {createHmac} = require('crypto');
const {
  dataValidationMiddleware,
  generateHashMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  isUserValidMiddleware,
  canDeleteMiddleware,
  deleteUserMiddleware,
  fetchTokenMiddleware} = require('./auth-middleware')
const {AUTH_SECRET_KEY,HOST_URL} = require("../constants")

const {roleManager,storeTokens,validateTokenMiddleware,allowLoginUsersMiddleware} = require("../commonMiddleware")

authRouter.get('/',
  allowLoginUsersMiddleware(true),
  validateTokenMiddleware,
  storeTokens,
  roleManager,
  async (req,res)=>{
    return res.status(200).send("JWT token is valid");
  }
)

authRouter.get('/login',
  allowLoginUsersMiddleware(false),
  async (req,res)=>{
      return res.status(200).send("login page");
  }
)

authRouter.post('/login',
  allowLoginUsersMiddleware(false),
  dataValidationMiddleware,
  isUserValidMiddleware,
    fetchTokenMiddleware,
    storeTokens,
    async (req,res)=>{
      return res.status(200).send('Login Successful');
  }
);

authRouter.post('/validate',
  dataValidationMiddleware, async (req,res)=> {
    return res.status(200).send('Valid User');
  }
)

authRouter.post('/signup',
  generateHashMiddleware,
  dataValidationMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  async (req, res) => {
      return res.status(200).send("User Successfully Created")
  });

authRouter.delete('/delete/:userId',
  canDeleteMiddleware,
  deleteUserMiddleware,
  async (req, res) => {
    return res.status(200).send("User Deleted Successfully")
  }
);

authRouter.delete('/delete', async (req, res) => {
    return res.status(400).send("No User provided");
});

authRouter.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');
  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});



function generateSignedURL(username) {
  const url = `/reset-password`
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const expiryTimestamp = timestamp + 600;

  const signature = createHmac('sha256', AUTH_SECRET_KEY)
                             .update(`${url}?user=${username}&expiry=${expiryTimestamp}`)
                             .digest('hex');
    return `${url}?user=${username}&expiry=${expiryTimestamp}&signature=${signature}`;
}


function verifySignedURL(params) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > params.expiry) {
        return false; // URL has expired
    }
    const expectedSignature = createHmac('sha256', AUTH_SECRET_KEY)
                                   .update(`/reset-password?user=${params.user}&expiry=${params.expiry}`)
                                   .digest('hex');
    return params.signature === expectedSignature;
}

function middlewareSignedURL(req, res, next) {
    if (Object.keys(req.query).length === 0) {
      const signed = generateSignedURL("admin")
      res.locals.signed = true
      res.locals.url = req.protocol + '://' + req.headers.host + signed
    }else {
      res.locals.signed = false
    }
    return next()
}

function middlewareVerifySignedURL(req,res,next){
  if (Object.keys(req.query).length !== 0) {
    if(verifySignedURL(req.query)){
      next()
    }
    return res.status(400).send("Invalid url");
  }
  return next()
}

authRouter.get('/reset-password',
  middlewareSignedURL,
  middlewareVerifySignedURL,
  async (req,res)=>{
  if(res.locals.signed) {
    return res.status(200).send(res.locals.url);
  }
  return res.status(200).send("Password changed successfully");
})
module.exports = {authRouter}


