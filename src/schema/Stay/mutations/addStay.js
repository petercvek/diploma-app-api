// @flow
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';

import Stay from 'schema/Stay';
import { LocationInput } from 'schema/Location';
import createLocation from 'helpers/createLocation';

const StayInput = new GraphQLInputObjectType({
  name: 'StayInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    checkIn: {
      type: GraphQLString,
    },
    checkOut: {
      type: GraphQLString,
    },
    notes: {
      type: GraphQLString,
    },
    price: {
      type: GraphQLFloat,
    },
    location: {
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
  stay: {
    id: string,
    name: string,
    checkIn: string,
    checkOut: string,
    notes: string,
    price: number,
    location: LocationData,
  },
};

const addStay = async (parent: any, args: Args, context: Context) => {
  try {
    const newLocationId = await createLocation(args.stay.location);

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
      INSERT INTO stays (participant_id, id, name, check_in, check_out, notes, price, location_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
      `,
      [
        pariticipant.id,
        args.stay.id,
        args.stay.name,
        args.stay.checkIn,
        args.stay.checkOut,
        args.stay.notes,
        args.stay.price * 100,
        newLocationId,
      ],
    );
    const [addedStay] = insertResult.rows;

    return await context.dataLoaders.stayLoader.load(addedStay.id);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Stay,
  args: {
    tripId: {
      type: GraphQLID,
    },
    stay: {
      type: new GraphQLNonNull(StayInput),
    },
  },
  resolve: addStay,
};
