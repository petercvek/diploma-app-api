// @flow
import { GraphQLObjectType, GraphQLID, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import db from 'db';

import captureException from 'helpers/captureException';

import TripParticipants from 'schema/Trip/TripParticipants';
import TripStays from 'schema/Trip/TripStays';
import TripActivities from 'schema/Trip/TripActivities';
import TripNavigations from 'schema/Trip/TripNavigations';

const Trip = new GraphQLObjectType({
  name: 'Trip',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLDateTime,
    },
    endAt: {
      type: GraphQLDateTime,
    },
    coverPhoto: {
      type: GraphQLString,
    },
    participants: TripParticipants,
    stays: TripStays,
    activities: TripActivities,
    navigations: TripNavigations,
    inviteCode: {
      type: GraphQLString,
    },
  }),
});

const tripLoader = async (tripIds: Array<numbers>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        name,
        start_at,
        end_at,
        cover_photo,
        invite_code
      FROM trips
      WHERE id = ANY ($1)
    `,
      [tripIds],
    );

    const trips = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      startAt: row.start_at,
      endAt: row.end_at,
      coverPhoto: row.cover_photo,
      inviteCode: row.invite_code,
    }));

    return tripIds.map(tripId => trips.find(trip => trip.id === tripId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Trip;
export { tripLoader };
