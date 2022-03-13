const faunadb = require('faunadb');
const client = require('.');

const  { Create, Collection, Get, Match, Index } = faunadb.query;

const collection = 'workflows';
const index_by_id = 'workflow_by_id';

const Workflow = {
  create: async (data) => {
    console.log(client)
    try {
      return await client.query(
        Create(
          Collection(collection),
          { data }
        )
      )
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    
    return null;
  },
  get: async (id) => {
    console.log(client)
    try {
      return await client.query(
        Get(
          Match(Index(index_by_id), parseInt(id))
        )
      )
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    
    return null;
  }
}

module.exports = Workflow;
