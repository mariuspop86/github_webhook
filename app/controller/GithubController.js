const { faunadbclient, github, ptaToken, secret, slack_url } = require('../constant/github');
const express = require('express');
const axios = require('axios');
const { createHmac, timingSafeEqual } = require('crypto');
const faunadb = require('faunadb');

const client = new faunadb.Client({ secret: faunadbclient, domain: 'db.eu.fauna.com', scheme: 'https', port: 443 })

const  { Create, Collection } = faunadb.query;

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
	const { host, reposAPI, runsAPI } = github;
	const {ref, repository: { full_name }, sender: { login, html_url } } = req.body;
	const [,,branch] = ref.split('/');
	
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
  .then( (res) => {
		axios.get(host+runsAPI, {
			headers: {
				'Authorization': `token ${ptaToken}`
			}
		}).then(async (res) => {
			
			const { workflow_runs } = res.data;
			const [firstWorkflow] = workflow_runs;
			const { id, html_url, name, status, conclusion } = firstWorkflow;
			const data = {
				user: { login, html_url },
				workflow: { id, html_url, name, status, conclusion }
			}
			console.log(data);
			try {
				const response = await client.query(
					Create(
						Collection('workflows'),
						{data}
					)
				)
				console.log(response);
			} catch (e) {
				console.log(e.message);
			}
		});
		
		
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

