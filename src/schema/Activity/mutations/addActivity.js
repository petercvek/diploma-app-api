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

import Activity from 'schema/Activity';
import { LocationInput } from 'schema/Location';
import createLocation from 'helpers/createLocation';

const ActivityInput = new GraphQLInputObjectType({
  name: 'ActivityInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    startAt: {
      type: GraphQLString,
    },
    endAt: {
      type: GraphQLString,
    },
    category: {
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
  activity: {
    id: string,
    name: string,
    startAt: string,
    endAt: string,
    category: string,
    notes: string,
    price: number,
    location: LocationData,
  },
};

const addActivity = async (parent: any, args: Args, context: Context) => {
  try {
    const newLocationId = await createLocation(args.activity.location);

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
      INSERT INTO activities (participant_id, id, name, start_at, end_at, category, notes, price, location_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
      `,
      [
        pariticipant.id,
        args.activity.id,
        args.activity.name,
        args.activity.startAt,
        args.activity.endAt,
        args.activity.category,
        args.activity.notes,
        args.activity.price,
        newLocationId,
      ],
    );
    const [addedActivity] = insertResult.rows;

    return context.dataLoaders.activityLoader.load(addedActivity.id);
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Activity,
  args: {
    tripId: {
      type: GraphQLID,
    },
    activity: {
      type: new GraphQLNonNull(ActivityInput),
    },
  },
  resolve: addActivity,
};
