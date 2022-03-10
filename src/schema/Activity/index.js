// @flow
import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import db from 'db';

import captureException from 'helpers/captureException';

import Location from 'schema/Location';

const Activity = new GraphQLObjectType({
  name: 'Activity',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLDateTime,
    },
    endAt: {
      type: GraphQLDateTime,
    },
    category: {
      type: GraphQLString,
    },
    location: {
      type: Location,
      resolve: (parent, args, context) =>
        parent.locationId && context.dataLoaders.locationLoader.load(parent.locationId),
    },
    notes: {
      type: GraphQLString,
    },
    price: {
      type: GraphQLFloat,
    },
  }),
});

const activityLoader = async (activityIds: Array<numbers>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        name,
        start_at,
        end_at,
        category,
        location_id,  
        notes,
        price
      FROM activities
      WHERE id = ANY ($1)
    `,
      [activityIds],
    );

    const activities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      startAt: row.start_at,
      endAt: row.end_at,
      category: row.category,
      notes: row.notes,
      price: row.price,
      locationId: row.location_id,
    }));

    return activityIds.map(activityId => activities.find(activity => activity.id === activityId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Activity;
export { activityLoader };
