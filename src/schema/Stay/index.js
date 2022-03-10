// @flow
import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import db from 'db';

import captureException from 'helpers/captureException';

import Location from 'schema/Location';

const Stay = new GraphQLObjectType({
  name: 'Stay',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    checkIn: {
      type: GraphQLDateTime,
    },
    checkOut: {
      type: GraphQLDateTime,
    },
    notes: {
      type: GraphQLString,
    },
    location: {
      type: Location,
      resolve: (parent, args, context) =>
        parent.locationId && context.dataLoaders.locationLoader.load(parent.locationId),
    },
    price: {
      type: GraphQLFloat,
    },
  }),
});

const stayLoader = async (stayIds: Array<numbers>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        name,
        check_in,
        check_out,
        notes,
        price,  
        location_id
      FROM stays
      WHERE id = ANY ($1)
    `,
      [stayIds],
    );

    const stays = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      checkIn: row.check_in,
      checkOut: row.check_out,
      notes: row.notes,
      price: row.price / 100,
      locationId: row.location_id,
    }));

    return stayIds.map(stayId => stays.find(stay => stay.id === stayId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Stay;
export { stayLoader };
