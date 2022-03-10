// @flow
import { GraphQLID } from 'graphql';

import captureException from 'helpers/captureException';

import Stay from 'schema/Stay';

type Args = {
  stayId: string,
};

const getStay = async (parent: any, args: Args, context: Context) => {
  try {
    return context.dataLoaders.stayLoader.load(parseInt(args.stayId, 10));
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Stay,
  args: {
    stayId: {
      type: GraphQLID,
    },
  },
  resolve: getStay,
};
