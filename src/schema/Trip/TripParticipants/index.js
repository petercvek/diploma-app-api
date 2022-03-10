// @flow
import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import db from 'db';
import captureException from 'helpers/captureException';

import Participant from 'schema/Participant';

const TripParticipantsConnection = new GraphQLObjectType({
  name: 'TripParticipantsConnection',
  fields: () => ({
    items: {
      type: new GraphQLList(Participant),
    },
    count: {
      type: GraphQLInt,
    },
  }),
});

const getTripParticipants = async (parent: { id: number }, args: any, context: Context) => {
  try {
    const participants = await context.dataLoaders.tripParticipantsLoader.load(parent.id);

    const count = participants.length;
    const participantIds = participants.map(participant => participant.id);

    return {
      items: await context.dataLoaders.participantLoader.loadMany(participantIds),
      count,
    };
  } catch (error) {
    captureException(error);
  }
};

const tripParticipantsLoader = async (tripIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT id, trip_id
      FROM participants
      WHERE trip_id = ANY ($1) AND removed = FALSE
      ORDER BY id ASC
      `,
      [tripIds],
    );
    const participants = result.rows.map(row => ({
      id: row.id,
      tripId: row.trip_id,
    }));

    return tripIds.map(tripId => participants.filter(participant => participant.tripId === tripId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: TripParticipantsConnection,
  resolve: getTripParticipants,
};

export { tripParticipantsLoader };
