// @flow
import { GraphQLID, GraphQLString } from 'graphql';
import db from 'db';

import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  tripId: string,
  inviteCode: string,
};

const getTrip = async (parent: any, args: Args, context: Context) => {
  try {
    if (args.inviteCode !== undefined) {
      if (args.inviteCode === null) return Error('INVALID_INVITE_CODE');

      const result = await db.query(
        `
        SELECT id
        FROM trips
        WHERE invite_code = $1
      `,
        [args.inviteCode],
      );
      const [trip] = result.rows;

      if (!trip) return Error('INVALID_INVITE_CODE');

      return context.dataLoaders.tripLoader.load(trip.id);
    }
    return context.dataLoaders.tripLoader.load(parseInt(args.tripId, 10));
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Trip,
  args: {
    tripId: {
      type: GraphQLID,
    },
    inviteCode: {
      type: GraphQLString,
    },
  },
  resolve: getTrip,
};
