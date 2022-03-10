// @flow
import { GraphQLID } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Trip from 'schema/Trip';

type Args = {
  navigationId: string,
};

const removeNavigation = async (parent: null, args: Args, context: Context) => {
  try {
    const result = await db.query(
      `
      DELETE FROM navigations
      USING participants
      WHERE navigations.participant_id = participants.id AND navigations.id = $1
      RETURNING participants.trip_id
      `,
      [args.navigationId],
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
    navigationId: {
      type: GraphQLID,
    },
  },
  resolve: removeNavigation,
};
