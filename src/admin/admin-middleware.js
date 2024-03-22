const {fetchQuery,updateUserRole} = require("./admin-tools")

async function userQueryMiddleware(req, res, next) {
  const username = req.query.username
  const id = req.query.id

  res.locals.entries = await fetchQuery(username,id)
  if (res.locals.entries.length === 0){
    return res.status(400).send('Query not Valid')
  }
  return next()
}

async function updateRoleQueryMiddleware(req, res, next) {
  const username = req.query.username
  const id = req.query.id
  const role = req.query.role
  try {
    await updateUserRole(username, id, role)
    next()
  } catch(error){
    return res.status(400).send(error.message)
  }
}


module.exports = {userQueryMiddleware,updateRoleQueryMiddleware}
