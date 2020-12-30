const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const express = require('express');
const morgan = require('morgan');

const apiRouter = require('./api/api');


const PORT = process.env.PORT || 4000;

const app = express();
module.exports = app;

// All routes
app.use(errorhandler());
app.use(morgan('short'));
app.use(bodyParser.json());
app.use(cors());

app.use('/api',apiRouter);

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  });