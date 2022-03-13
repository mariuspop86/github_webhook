const faunadb = require('faunadb');
const Client = require('.');

const  { Create, Collection, Get, Match, Index } = faunadb.query;

const collection = 'workflows';
const index_by_id = 'workflow_by_id';

const Workflow = {
  create: async (data) => {
    try {
      return await Client.query(
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
    try {
      return await Client.query(
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
