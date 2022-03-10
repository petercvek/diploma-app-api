// @flow
import { GraphQLNonNull, GraphQLID } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  tripId: string,
};

const addParticipant = async (parent: any, args: Args, context: Context) => {
  try {
    // Check if you can add participant
    const existingParticipantResult = await db.query(
      `
      SELECT id
      FROM participants
      WHERE
        account_id = $1
        AND trip_id = $2
      `,
      [context.user.id, args.tripId],
    );
    const [existingParticipant] = existingParticipantResult.rows;

    if (!existingParticipant) {
      await db.query(
        `
      INSERT INTO participants (trip_id, account_id)
      VALUES ($1, $2)
      RETURNING id
      `,
        [args.tripId, context.user.id],
      );
    } else {
      await db.query(
        `
      UPDATE participants
      SET removed = FALSE
      WHERE trip_id = $1 AND account_id = $2
      RETURNING id
      `,
        [args.tripId, context.user.id],
      );
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
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  resolve: addParticipant,
};
