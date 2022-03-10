// @flow
import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import db from 'db';
import captureException from 'helpers/captureException';

import Navigation from 'schema/Navigation';

const TripNavigationsConnection = new GraphQLObjectType({
  name: 'TripNavigationsConnection',
  fields: () => ({
    items: {
      type: new GraphQLList(Navigation),
    },
    count: {
      type: GraphQLInt,
    },
  }),
});

const getTripNavigations = async (parent: { id: number }, args: any, context: Context) => {
  try {
    const navigations = await context.dataLoaders.tripNavigationsLoader.load(parent.id);

    const count = navigations.length;
    const navigationIds = navigations.map(navigation => navigation.id);

    return {
      items: await context.dataLoaders.navigationLoader.loadMany(navigationIds),
      count,
    };
  } catch (error) {
    captureException(error);
  }
};

const tripNavigationsLoader = async (tripIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT navigations.id, participants.trip_id
      FROM navigations
      JOIN participants ON (navigations.participant_id = participants.id)
      WHERE participants.trip_id = ANY ($1)
      ORDER BY id DESC
      `,
      [tripIds],
    );

    const navigations = result.rows.map(row => ({
      id: row.id,
      tripId: row.trip_id,
    }));

    return tripIds.map(tripId => navigations.filter(navigation => navigation.tripId === tripId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: TripNavigationsConnection,
  resolve: getTripNavigations,
};

export { tripNavigationsLoader };
