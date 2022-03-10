// @flow
import Viewer from 'schema/Viewer';

const getViewer = async (parent: any, args: any, context: Context) => {
  const account = context.dataLoaders.accountLoader.load(context.user.id);

  return {
    account,
  };
};
export default {
  type: Viewer,
  resolve: getViewer,
};
