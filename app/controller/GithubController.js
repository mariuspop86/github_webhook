const { github, ptaToken, secret } = require('../constant/github');
const express = require('express');
const axios = require('axios');
const { createHmac, timingSafeEqual } = require('crypto');

const allowedBranches = ['develop', 'recette'];

const app = express();

app.use('/payload', (req, res, next) => {
  const sig = req.headers['x-hub-signature'] || null;
	const hmac = createHmac('sha1', secret);
	const digest = Buffer.from('sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
	const checksum = Buffer.from(sig, 'utf8');
	if (checksum.length !== digest.length || !timingSafeEqual(digest, checksum)) {
		console.log('signature does not match');
	  res.send('nok');
	} else {
	  next();
	}
}).post('/payload', async (req, res) => {
	const { host, reposAPI } = github;
	const {ref, repository: { full_name } } = req.body;
	const [,,branch] = ref.split('/');
	
	if (!allowedBranches.includes(branch)) {
		console.log('Branches does not match');
    res.send('nok');

    return;
	}
  axios.post(host+reposAPI, 
  	{
  		"event_type": full_name
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
