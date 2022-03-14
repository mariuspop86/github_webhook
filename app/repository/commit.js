const faunadb = require('faunadb');
const Client = require('.');

const  { Create, Collection } = faunadb.query;

const collection = 'commit';

const Commit = {
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
  }
}

module.exports = Commit;
