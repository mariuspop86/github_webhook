const { github, ptaToken, secret, slack_url } = require('../constant/github');
const express = require('express');
const axios = require('axios');
const { createHmac, timingSafeEqual } = require('crypto');

const allowedBranches = ['develop', 'recette', 'test-pipeline', 'pipeline'];

const app = express();

app.use('/payload?2', (req, res, next) => {
  const sig = req.headers['x-hub-signature'] || null;
	const hmac = createHmac('sha1', secret);
	const digest = Buffer.from('sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
	const checksum = Buffer.from(sig, 'utf8');
	if (checksum.length !== digest.length || !timingSafeEqual(digest, checksum)) {
		console.log('Signature does not match');
	  res.send('nok');
	} else {
		console.log('Signature matched!')
	  next();
	}
}).post('/payload', async (req, res) => {
	const { host, reposAPI } = github;
	const {ref, repository: { full_name } } = req.body;
	const [,,branch] = ref.split('/');
	console.log(req.body)
	if (!allowedBranches.includes(branch)) {
		console.log(`Branch ${branch} from ${full_name} repo does not match`);
    res.send('nok');

    return;
	}
  axios.post(host+reposAPI, 
  	{
  		"event_type": full_name,
			"client_payload": { "branch": branch }
  	},
    {
  	  headers: {
  		  'Authorization': `token ${ptaToken}`
  	  }
  })
  .then((res) => {
		console.log(res.body)
    console.log(`Webhook sent for branch ${branch} on repo ${full_name}`)
  })
  .catch(error => {
    console.log('error', error);
  });

  res.send('ok');
}).post('/payload2',(req, res) => {
	const { action, workflow_run: { name, conclusion, html_url } } = req.body;
	
	if (action==='completed') {
		// axios.post(slack_url,
		// 	{
		// 		"text": ` - workflow <${html_url}|*${name}*> completed with *${conclusion}* - `
		// 	})
		// 	.catch(error => {
		// 		console.log('error', error);
		// 	});
	}
	
	res.send('ok');
});

module.exports = app;

