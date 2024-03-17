const isJenkins = process.env.JENKINS === 'true';

if (!isJenkins){
  require('dotenv').config();
}

module.exports= { AUTH_SECRET_KEY : process.env.AUTH_SECRET_KEY,
                  REFRESH_SECRET_KEY : process.env.REFRESH_SECRET_KEY,
                  SERVER_SECRET_KEY: process.env.SERVER_SECRET_KEY,
                  HOST_URL: process.env.HOST,
                  DB_URL: process.env.DB_URL,
                  TOKEN_URL: process.env.TOKEN_URL,
                  isJenkins}