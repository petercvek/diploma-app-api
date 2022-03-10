// @flow
import { GraphQLID } from 'graphql';

import captureException from 'helpers/captureException';

import Navigation from 'schema/Navigation';

type Args = {
  navigationId: string,
};

const getNavigation = async (parent: any, args: Args, context: Context) => {
  try {
    return context.dataLoaders.navigationLoader.load(parseInt(args.navigationId, 10));
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Navigation,
  args: {
    navigationId: {
      type: GraphQLID,
    },
  },
  resolve: getNavigation,
};
