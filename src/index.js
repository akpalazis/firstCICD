const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address