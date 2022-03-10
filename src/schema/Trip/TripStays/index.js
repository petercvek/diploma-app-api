// @flow
import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import db from 'db';
import captureException from 'helpers/captureException';

import Stay from 'schema/Stay';

const TripStaysConnection = new GraphQLObjectType({
  name: 'TripStaysConnection',
  fields: () => ({
    items: {
      type: new GraphQLList(Stay),
    },
    count: {
      type: GraphQLInt,
    },
  }),
});

const getTripStays = async (parent: { id: number }, args: any, context: Context) => {
  try {
    const stays = await context.dataLoaders.tripStaysLoader.load(parent.id);

    const count = stays.length;
    const stayIds = stays.map(stay => stay.id);

    return {
      items: await context.dataLoaders.stayLoader.loadMany(stayIds),
      count,
    };
  } catch (error) {
    captureException(error);
  }
};

const tripStaysLoader = async (tripIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT stays.id, participants.trip_id
      FROM stays
      JOIN participants ON (stays.participant_id = participants.id)
      WHERE participants.trip_id = ANY ($1)
      ORDER BY id DESC
      `,
      [tripIds],
    );

    const stays = result.rows.map(row => ({
      id: row.id,
      tripId: row.trip_id,
    }));

    return tripIds.map(tripId => stays.filter(stay => stay.tripId === tripId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: TripStaysConnection,
  resolve: getTripStays,
};

export { tripStaysLoader };
