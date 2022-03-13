const faunadb = require('faunadb');
const { faunadbclient } = require("../constant/github");

const faunaClient = new faunadb.Client({ 
  secret: faunadbclient, 
  domain: 'db.eu.fauna.com', 
  scheme: 'https', 
  port: 443 
})

module.exports = faunaClient;
