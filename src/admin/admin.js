const express = require('express');
const adminRouter = express.Router();
const {userQueryMiddleware,updateRoleQueryMiddleware} = require('./admin-middleware')

adminRouter.get('/admin/users',
  userQueryMiddleware,
  async (req,res)=> {
    res.status(200).json(res.locals.entries)
  }
)

//TODO: add the tests
adminRouter.get('/admin/alter_role',
  updateRoleQueryMiddleware,
  async (req,res)=> {
    res.status(200).json("Role updated successfully.")
  }
)

module.exports = {adminRouter}


