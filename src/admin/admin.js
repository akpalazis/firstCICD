const express = require('express');
const adminRouter = express.Router();
const {userQueryMiddleware,updateRoleQueryMiddleware} = require('./admin-middleware')
const {storeTokens,roleManager,validateTokenMiddleware,allowLoginUsersMiddleware} = require("../commonMiddleware")

adminRouter.get('/admin/users',
  allowLoginUsersMiddleware(true),
  validateTokenMiddleware,
  storeTokens,
  roleManager,
  userQueryMiddleware,
  async (req,res)=> {
    res.status(200).json(res.locals.entries)
  }
)

adminRouter.get('/admin/alter_role',
  allowLoginUsersMiddleware(true),
  validateTokenMiddleware,
  storeTokens,
  roleManager,
  updateRoleQueryMiddleware,
  async (req,res)=> {
    res.status(200).json("Role updated successfully.")
  }
)

module.exports = {adminRouter}


