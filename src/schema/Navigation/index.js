// @flow
import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import db from 'db';

import captureException from 'helpers/captureException';

import Location from 'schema/Location';

const Navigation = new GraphQLObjectType({
  name: 'Navigation',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    type: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLDateTime,
    },
    duration: {
      type: GraphQLFloat,
    },
    distance: {
      type: GraphQLFloat,
    },
    startingLocation: {
      type: Location,
      resolve: (parent, args, context) =>
        parent.startingLocationId &&
        context.dataLoaders.locationLoader.load(parent.startingLocationId),
    },
    endingLocation: {
      type: Location,
      resolve: (parent, args, context) =>
        parent.endingLocationId && context.dataLoaders.locationLoader.load(parent.endingLocationId),
    },
    route: {
      type: GraphQLString,
    },
  }),
});

const navigationLoader = async (navigationIds: Array<numbers>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        type,
        start_at,
        duration,
        distance,
        starting_location_id,  
        ending_location_id,
        route
      FROM navigations
      WHERE id = ANY ($1)
    `,
      [navigationIds],
    );

    const navigations = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      startAt: row.start_at,
      duration: row.duration,
      distance: row.distance,
      startingLocationId: row.starting_location_id,
      endingLocationId: row.ending_location_id,
      route: row.route,
    }));

    return navigationIds.map(navigationId =>
      navigations.find(navigation => navigation.id === navigationId),
    );
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Navigation;
export { navigationLoader };
