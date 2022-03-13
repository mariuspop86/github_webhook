const faunadb = require('faunadb');
const { faunadbclient } = require("../constant/github");

const client = new faunadb.Client({ 
  secret: faunadbclient, 
  domain: 'db.eu.fauna.com', 
  scheme: 'https', 
  port: 443 
})

module.exports = client;
