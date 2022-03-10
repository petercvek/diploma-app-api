// @flow
import { GraphQLObjectType, GraphQLID } from 'graphql';
import db from 'db';

import captureException from 'helpers/captureException';

import Account from 'schema/Account';

const Participant = new GraphQLObjectType({
  name: 'Participant',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    account: {
      type: Account,
      resolve: (parent, args, context) =>
        parent.accountId && context.dataLoaders.accountLoader.load(parent.accountId),
    },
  }),
});

const participantLoader = async (participantIds: Array<numbers>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        account_id
      FROM participants
      WHERE id = ANY ($1)
    `,
      [participantIds],
    );
    const participants = result.rows.map(row => ({
      id: row.id,
      accountId: row.account_id,
    }));

    return participantIds.map(participantId =>
      participants.find(participant => participant.id === participantId),
    );
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Participant;
export { participantLoader };
