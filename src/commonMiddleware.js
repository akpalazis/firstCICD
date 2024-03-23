async function roleManager(req, res, next) {
  const username = req.query.username
  const id = req.query.id

  res.locals.entries = await fetchQuery(username,id)
  if (res.locals.entries.length === 0){
    return res.status(400).send('Query not Valid')
  }
  return next()
}

module.exports = {roleManager}