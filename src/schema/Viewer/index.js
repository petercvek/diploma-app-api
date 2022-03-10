// @flow
import { GraphQLObjectType } from 'graphql';

import Account from 'schema/Account';

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    account: {
      type: Account,
    },
  },
});

export default Viewer;
