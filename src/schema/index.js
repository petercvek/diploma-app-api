// @flow
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import activityQueries from 'schema/Activity/queries';
import activityMutations from 'schema/Activity/mutations';
import participantMutations from 'schema/Participant/mutations';
import navigationQueries from 'schema/Navigation/queries';
import navigationMutations from 'schema/Navigation/mutations';
import stayQueries from 'schema/Stay/queries';
import stayMutations from 'schema/Stay/mutations';
import tripQueries from 'schema/Trip/queries';
import tripMutations from 'schema/Trip/mutations';
import viewerQueries from 'schema/Viewer/queries';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    ...activityQueries,
    ...navigationQueries,
    ...stayQueries,
    ...tripQueries,
    ...viewerQueries,
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...activityMutations,
    ...navigationMutations,
    ...participantMutations,
    ...stayMutations,
    ...tripMutations,
  },
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
