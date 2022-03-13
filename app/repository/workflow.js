const faunadb = require('faunadb');
const client = require('.');

const  { Create, Collection, Get, Match, Index } = faunadb.query;

const collection = 'workflows';
const index_by_id = 'workflow_by_id';

const Workflow = {
  create: async (data) => {
    try {
      return await client.query(
        Create(
          Collection(collection),
          { data }
        )
      )
    } catch (e) {
      console.log(e.message);
    }
    
    return null;
  },
  get: async (id) => {
    try {
      return await client.query(
        Get(
          Match(Index(index_by_id), id)
        )
      )
    } catch (e) {
      console.log(e.message);
    }
    
    return null;
  }
}

module.exports = Workflow;
