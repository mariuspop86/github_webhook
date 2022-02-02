'use strict';
const express = require('express');
const cors = require('cors');
const GithubController = require('./app/controller/GithubController');
const BaseController = require('./app/controller/BaseController');

// Constants
const PORT = process.env.PORT || 45454;
const HOST = '0.0.0.0';

const app = express();
const corsOptions = {
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended:false})); // for parsing applicatino/x-www-form-urlencoded
app.use(BaseController);
app.use(GithubController);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
