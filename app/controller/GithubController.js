const { github, ptaToken } = require('../constant/github');
const express = require('express');
const axios = require('axios');
// const GitlabManager = require('../manager/GitlabManager');

const app = express();

app.use('/payload', (req, res, next) => {
  console.log(req.body)

  next();
}).post('/payload', async (req, res) => {
	const { host, reposAPI } = github
	// GitlabManager.sendSlackMessage(req);
  axios.post(host+reposAPI, 
  	{
  		"event_type": 'beprems/KYB-white-label'
  	},
  {
  	headers: {
  		'Authorization': `token ${ptaToken}`
  	}
  })
  .then(response => {
    console.log(response)
  })
  .catch(error => {
    console.log('error', error);
  });

  res.send('ok');
});

module.exports = app;
