const dotenv = require('dotenv');
dotenv.config();

const github = {
  host: 'https://api.github.com',
  reposAPI: `/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/dispatches`,
  runsAPI: `/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/actions/runs`,
};

const ptaToken = process.env.GITHUB_PTA
const secret = process.env.GITHUB_SECRET
const slack_url = process.env.SLACK_URL
const faunadbclient = process.env.FAUNADB_CLIENT

module.exports = {
  faunadbclient,
  github,
  ptaToken,
  secret,
  slack_url
};
