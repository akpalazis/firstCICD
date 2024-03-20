const express = require('express');
const adminRouter = express.Router();
const {userQueryMiddleware} = require('./admin-middleware')

adminRouter.get('/admin/users',
  userQueryMiddleware,
  async (req,res)=> {
    res.status(200).json(res.locals.entries)
  }
)

module.exports = {adminRouter}


