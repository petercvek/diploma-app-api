// @flow
import { GraphQLObjectType, GraphQLID } from 'graphql';
import db from 'db';

import captureException from 'helpers/captureException';

const Account = new GraphQLObjectType({
  name: 'Account',
  fields: {
    id: {
      type: GraphQLID,
    },
  },
});

const accountLoader = async (accountIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT id
      FROM accounts
      WHERE id = ANY ($1)
    `,
      [accountIds],
    );
    const accounts = result.rows.map(row => ({
      id: row.id,
    }));

    return accountIds.map(accountId => accounts.find(account => account.id === accountId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Account;
export { accountLoader };
