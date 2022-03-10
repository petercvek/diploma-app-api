// @flow
import { GraphQLID } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  activityId: string,
};

const removeActivity = async (parent: null, args: Args, context: Context) => {
  try {
    const result = await db.query(
      `
      DELETE FROM activities
      USING participants
      WHERE activities.participant_id = participants.id AND activities.id = $1
      RETURNING participants.trip_id
      `,
      [args.activityId],
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
    activityId: {
      type: GraphQLID,
    },
  },
  resolve: removeActivity,
};
