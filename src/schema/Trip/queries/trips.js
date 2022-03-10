// @flow
import { GraphQLList } from 'graphql';
import db from 'db';

import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

const getTrips = async (parent: any, args: any, context: Context) => {
  try {
    const result = await db.query(
      `
        SELECT trips.id
        FROM trips
        JOIN participants ON (trips.id = participants.trip_id)
        WHERE participants.account_id = $1 AND removed = FALSE
        ORDER BY trips.start_at DESC, trips.end_at DESC
      `,
      [context.user.id],
    );
    const tripIds = result.rows.map(row => row.id);

    return context.dataLoaders.tripLoader.loadMany(tripIds);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: new GraphQLList(Trip),
  resolve: getTrips,
};
