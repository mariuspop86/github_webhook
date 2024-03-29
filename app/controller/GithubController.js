const { github, ptaToken, secret, slack_url } = require('../constant/github');
const express = require('express');
const axios = require('axios');
const { createHmac, timingSafeEqual } = require('crypto');
const Workflow = require('../repository/workflow');
const Commit = require('../repository/commit');

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
}).use('/action', (req, res, next) => {
	let valid = true;
	const { body } = req
	const validateOption = {
		'github': [
			'server_url', 
			'repository', 
			'run_id', 
			'workflow'
		], 
		'step': ['outcome'] 
	};
		
	Object.keys(validateOption).forEach(value => {
		if (valid && body.hasOwnProperty(value)) {
			validateOption[value].forEach(val => {
				if (valid && !body[value].hasOwnProperty(val)) {
					valid = false
				}
			})
		} else {
			valid = false
		}
	})
	
	if (!valid) {
		console.log('Invalid payload');
		res.status(400).send('nok');
	} else {
		console.log('Payload valid')
		next();
	}
}).post('/payload', async (req, res) => {
	const { host, reposAPI, runsAPI } = github;
	await Commit.create({payload:req.body});
	// const { ref, repository: { full_name }, sender: { login, html_url }, commits, head_commit } = req.body;
	// const user_html_url = html_url;
	// let commit_url = commits[0]?.url;
	// let author_name = commits[0]?.committer?.name;
	// console.log(commit_url, author_name);
	// if (!commit_url || !author_name) {
	// 	commit_url = head_commit?.url;
	// 	author_name = head_commit?.committer?.name;
	// }
	// console.log(commit_url, author_name);
	// const [,,branch] = ref.split('/');
	//
	// if (!allowedBranches.includes(branch)) {
	// 	console.log(`Branch ${branch} from ${full_name} repo does not match`);
  //   res.send('nok');
	//
  //   return;
	// }
	// try {
	// 	await axios.post(host + reposAPI,
	// 		{
	// 			"event_type": full_name,
	// 			"client_payload": {"branch": branch}
	// 		},
	// 		{
	// 			headers: {
	// 				'Authorization': `token ${ptaToken}`
	// 			}
	// 		});
	//	
	// 	setTimeout(async () => {
	// 		try {
	// 			const res = await axios.get(host+runsAPI, {
	// 				headers: {
	// 					'Authorization': `token ${ptaToken}`
	// 				}
	// 			});
	//
	// 			const { workflow_runs } = res.data;
	// 			const [firstWorkflow] = workflow_runs;
	// 			const { id, html_url, name } = firstWorkflow;
	// 			const data = {
	// 				user: { login, user_html_url, author_name },
	// 				workflow: { id, html_url, name, commit_url }
	// 			}
  //       await Workflow.create(data);
	// 		} catch (e) {
	// 			console.log(e.message);
	// 		}
	// 	}, 1500)
	// } catch (e) {
	// 	console.log(e.message);
	// }

  res.send('ok');
}).post('/payload2',async (req, res) => {
	await Commit.create({payload2:req.body});
	// const { action, workflow_run: { id, name, conclusion, html_url } } = req.body;
	// const e = await Workflow.get(id);
	//
	// let text = ` - workflow <${html_url}|*${name}*> completed with *${conclusion}* - `
	// if (e) {
	// 	const {user: {user_html_url, author_name},workflow: { commit_url } } = e.data
	// 	text += ` <${user_html_url}|*${author_name}*> pushed <${commit_url}|*commit*> `;
	// }
	//
	// if (action==='completed') {
	// 	axios.post(slack_url,
	// 		{
	// 			"text": text
	// 		})
	// 		.catch(error => {
	// 			console.log('error', error);
	// 		});
	// }
	
	res.send('ok');
}).post('/action',async (req, res) => {
	const { github: {server_url, repository, run_id, workflow}, step: { outcome } } = req.body;
	const html_url = server_url + '/' + repository + '/actions/runs/' + run_id;
	
	let text = ` - workflow <${html_url}|*${workflow}*> completed with *${outcome}* - `
	
	axios.post(slack_url,
		{
			"text": text
		})
		.catch(error => {
			console.log('error', error);
		});

	res.send('ok');
});

module.exports = app;
