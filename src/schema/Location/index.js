// @flow
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
} from 'graphql';
import db from 'db';

import captureException from 'helpers/captureException';

const Location = new GraphQLObjectType({
  name: 'Location',
  fields: {
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    latitude: {
      type: GraphQLString,
    },
    longitude: {
      type: GraphQLString,
    },
  },
});

const LocationInput = new GraphQLInputObjectType({
  name: 'LocationInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    latitude: {
      type: GraphQLFloat,
    },
    longitude: {
      type: GraphQLFloat,
    },
  },
});

const locationLoader = async (locationIds: Array<number>) => {
  try {
    const result = await db.query(
      `
      SELECT
	      id,
        name,
        latitude,
        longitude
      FROM locations
      WHERE id = ANY ($1)
    `,
      [locationIds],
    );

    const locations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
    }));

    return locationIds.map(locationId => locations.find(location => location.id === locationId));
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default Location;
export { locationLoader, LocationInput };
