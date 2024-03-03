let app;
const {isJenkins,HOST_URL} = require('../src/constants')
const {connectDB} = require('../src/db');

if (isJenkins){
  app  = HOST_URL
  connectDB()
} else{
  app = require('../src/app.js');
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = {app,delay}