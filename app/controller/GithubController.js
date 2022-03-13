const { github, ptaToken, secret, slack_url } = require('../constant/github');
const express = require('express');
const axios = require('axios');
const { createHmac, timingSafeEqual } = require('crypto');
const Workflow = require('../repository/workflow');

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
	const user_html_url = html_url;
	const [,,branch] = ref.split('/');
	
	if (!allowedBranches.includes(branch)) {
		console.log(`Branch ${branch} from ${full_name} repo does not match`);
    res.send('nok');

    return;
	}
	try {
		await axios.post(host + reposAPI,
			{
				"event_type": full_name,
				"client_payload": {"branch": branch}
			},
			{
				headers: {
					'Authorization': `token ${ptaToken}`
				}
			});
		
		setTimeout(async () => {
			try {
				const res = await axios.get(host+runsAPI, {
					headers: {
						'Authorization': `token ${ptaToken}`
					}
				});

				const { workflow_runs } = res.data;
				const [firstWorkflow] = workflow_runs;
				const { id, html_url, name, status, conclusion } = firstWorkflow;
				const data = {
					user: { login, user_html_url },
					workflow: { id, html_url, name, status, conclusion }
				}

				const e = await Workflow.create(data);
				console.log('Payload', e);

			} catch (e) {
				console.log(e.message);
			}
		}, 1500)
	} catch (e) {
		console.log(e.message);
	}

  res.send('ok');
}).post('/payload2',async (req, res) => {
	const { action, workflow_run: { id, name, conclusion, html_url } } = req.body;
	const e = await Workflow.get(id);
	console.log('Payload 2', id, e);
	
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
