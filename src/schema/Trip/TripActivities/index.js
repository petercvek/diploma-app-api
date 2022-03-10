// @flow
import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import db from 'db';
import captureException from 'helpers/captureException';

import Activity from 'schema/Activity';

const TripActivitiesConnection = new GraphQLObjectType({
  name: 'TripActivitiesConnection',
  fields: () => ({
    items: {
      type: new GraphQLList(Activity),
    },
    count: {
      type: GraphQLInt,
    },
  }),
});

const getTripActivities = async (parent: { id: number }, args: any, context: Context) => {
  try {
    const activities = await context.dataLoaders.tripActivitiesLoader.load(parent.id);

    const count = activities.length;
    const activityIds = activities.map(activity => activity.id);

    return {
      items: await context.dataLoaders.activityLoader.loadMany(activityIds),
      count,
    };
  } catch (error) {
    captureException(error);
  }
};

const tripActivitiesLoader = async (tripIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT activities.id, participants.trip_id
      FROM activities
      JOIN participants ON (activities.participant_id = participants.id)
      WHERE participants.trip_id = ANY ($1)
      ORDER BY id DESC
      `,
      [tripIds],
    );

    const activities = result.rows.map(row => ({
      id: row.id,
      tripId: row.trip_id,
    }));

    return tripIds.map(tripId => activities.filter(activity => activity.tripId === tripId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: TripActivitiesConnection,
  resolve: getTripActivities,
};

export { tripActivitiesLoader };
