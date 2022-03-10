// @flow
import {
  GraphQLID,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLFloat,
} from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Navigation from 'schema/Navigation';
import { LocationInput } from 'schema/Location';
import createLocation from 'helpers/createLocation';

const NavigationInput = new GraphQLInputObjectType({
  name: 'NavigationInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    type: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLString,
    },
    duration: {
      type: GraphQLFloat,
    },
    distance: {
      type: GraphQLFloat,
    },
    route: {
      type: GraphQLString,
    },
    startingLocation: {
      type: LocationInput,
    },
    endingLocation: {
      type: LocationInput,
    },
  },
});

type LocationData = {
  id: string,
  name: string,
  latitude: string,
  longitude: string,
};

type Args = {
  tripId: string,
  navigation: {
    id: string,
    type: string,
    startAt: string,
    duration: number,
    distance: number,
    route: string,
    startingLocation: LocationData,
    endingLocation: LocationData,
  },
};

const addNavigation = async (parent: any, args: Args, context: Context) => {
  try {
    const newStartingLocationId = await createLocation(args.navigation.startingLocation);
    const newEndingLocationId = await createLocation(args.navigation.endingLocation);

    const participantResult = await db.query(
      `
      SELECT id
      FROM participants
      WHERE trip_id = $1 AND account_id = $2
      `,
      [args.tripId, context.user.id],
    );
    const [pariticipant] = participantResult.rows;

    const insertResult = await db.query(
      `
      INSERT INTO navigations (participant_id, id, type, start_at, duration, distance, route, starting_location_id, ending_location_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
      `,
      [
        pariticipant.id,
        args.navigation.id,
        args.navigation.type,
        args.navigation.startAt,
        args.navigation.duration,
        args.navigation.distance,
        args.navigation.route,
        newStartingLocationId,
        newEndingLocationId,
      ],
    );
    const [addedNavigation] = insertResult.rows;

    return await context.dataLoaders.navigationLoader.load(addedNavigation.id);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Navigation,
  args: {
    tripId: {
      type: GraphQLID,
    },
    navigation: {
      type: NavigationInput,
    },
  },
  resolve: addNavigation,
};
