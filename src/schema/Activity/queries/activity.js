// @flow
import { GraphQLID } from 'graphql';

import captureException from 'helpers/captureException';

import Activity from 'schema/Activity';

type Args = {
  activityId: string,
};

const getActivity = async (parent: any, args: Args, context: Context) => {
  try {
    return context.dataLoaders.activityLoader.load(parseInt(args.activityId, 10));
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Activity,
  args: {
    activityId: {
      type: GraphQLID,
    },
  },
  resolve: getActivity,
};
