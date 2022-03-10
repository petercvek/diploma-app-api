// @flow
import { GraphQLID } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  stayId: string,
};

const removeStay = async (parent: null, args: Args, context: Context) => {
  try {
    const result = await db.query(
      `
      DELETE FROM stays
      USING participants
      WHERE stays.participant_id = participants.id AND stays.id = $1
      RETURNING participants.trip_id
      `,
      [args.stayId],
    );
    const [activity] = result.rows;

    return context.dataLoaders.tripLoader.load(activity.trip_id);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Trip,
  args: {
    stayId: {
      type: GraphQLID,
    },
  },
  resolve: removeStay,
};
