const dotenv = require('dotenv');
dotenv.config();

const github = {
  host: 'https://api.github.com',
  reposAPI: `/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/dispatches`,
};

const ptaToken = process.env.GITHUB_PTA
const secret = process.env.GITHUB_SECRET
const slack_url = process.env.SLACK_URL

module.exports = {
  github,
  ptaToken,
  secret,
  slack_url
};
