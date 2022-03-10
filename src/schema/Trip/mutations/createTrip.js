// @flow
import { GraphQLString } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  name: string,
  startAt: string,
  endAt: string,
  coverPhoto: string,
};

const createTrip = async (parent: any, args: Args, context: Context) => {
  try {
    const inviteCode = Math.round(Math.random() * 899999 + 100000);
    const insertResult = await db.query(
      `
      INSERT INTO trips (name, start_at, end_at, cover_photo, invite_code)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [args.name, args.startAt, args.endAt, args.coverPhoto, inviteCode],
    );
    const [createdTrip] = insertResult.rows;

    // Add the user that created the trip as participant
    await db.query(
      `
      INSERT INTO participants (trip_id, account_id)
      VALUES ($1, $2)
      `,
      [createdTrip.id, context.user.id],
    );

    return context.dataLoaders.tripLoader.load(createdTrip.id);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Trip,
  args: {
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
  resolve: createTrip,
};
