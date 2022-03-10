// @flow
import { GraphQLID, GraphQLString } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  tripId: string,
  name: string,
  startAt: string,
  endAt: string,
  coverPhoto: string,
};

const editTrip = async (parent: any, args: Args, context: Context) => {
  try {
    const updateResult = await db.query(
      `
      UPDATE trips
      SET
        name = $2,
        start_at = $3,
        end_at = $4,
        cover_photo = $5
      WHERE id = $1
      RETURNING id
      `,
      [args.tripId, args.name, args.startAt, args.endAt, args.coverPhoto],
    );
    const [editedTrip] = updateResult.rows;

    return context.dataLoaders.tripLoader.load(editedTrip.id);
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
    name: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLString,
    },
    endAt: {
      type: GraphQLString,
    },
    coverPhoto: {
      type: GraphQLString,
    },
  },
  resolve: editTrip,
};
