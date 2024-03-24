const express = require('express');
const adminRouter = express.Router();
const {userQueryMiddleware,updateRoleQueryMiddleware} = require('./admin-middleware')
const {roleManager} = require("../commonMiddleware")

adminRouter.get('/admin/users',
  userQueryMiddleware,
  async (req,res)=> {
    res.status(200).json(res.locals.entries)
  }
)

adminRouter.get('/admin/alter_role',
  roleManager,
  updateRoleQueryMiddleware,
  async (req,res)=> {
    res.status(200).json("Role updated successfully.")
  }
)

module.exports = {adminRouter}


