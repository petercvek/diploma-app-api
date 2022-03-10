// @flow
import { GraphQLObjectType, GraphQLSchema, GraphQLBoolean } from 'graphql';

import mutations from 'auth-schema/mutations';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    test: {
      type: GraphQLBoolean,
      resolve: () => true,
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...mutations,
  },
});

const AuthSchema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default AuthSchema;
