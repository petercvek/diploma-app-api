/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// @flow
import { GraphQLID } from 'graphql';
import db from 'db';
import captureException from 'helpers/captureException';
import { v4 as uuidv4 } from 'uuid';

import Trip from 'schema/Trip';

type Args = {
  tripId: string,
};

const duplicateTrip = async (parent: any, args: Args, context: Context) => {
  try {
    const insertedTripResult = await db.query(
      `
      INSERT INTO trips (name, start_at, end_at, cover_photo)
      SELECT name, start_at, end_at, cover_photo
      FROM trips
      WHERE trips.id = $1
      RETURNING id
      `,
      [args.tripId],
    );
    const [createdTrip] = insertedTripResult.rows;

    const insertedParticipantResult = await db.query(
      `
      INSERT INTO participants (trip_id, account_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [createdTrip.id, context.user.id],
    );
    const [createdParticipant] = insertedParticipantResult.rows;

    // duplicate stays
    const stays = await context.dataLoaders.tripStaysLoader.load(parseInt(args.tripId, 10));
    for (const stay of stays) {
      await db.query(
        `
        INSERT INTO stays (participant_id, id, name, check_in, check_out, notes, price, location_id)
        SELECT $1, $2, name, check_in, check_out, notes, price, location_id
        FROM stays
        WHERE stays.id = $3
      `,
        [createdParticipant.id, uuidv4(), stay.id],
      );
    }

    // duplicate activities
    const activities = await context.dataLoaders.tripActivitiesLoader.load(
      parseInt(args.tripId, 10),
    );
    for (const activity of activities) {
      await db.query(
        `
        INSERT INTO activities (participant_id, id, name, start_at, end_at, category, notes, price, location_id)
        SELECT $1, $2, name, start_at, end_at, category, notes, price, location_id
        FROM activities
        WHERE activities.id = $3
      `,
        [createdParticipant.id, uuidv4(), activity.id],
      );
    }

    // duplicate navigations
    const navigations = await context.dataLoaders.tripNavigationsLoader.load(
      parseInt(args.tripId, 10),
    );
    for (const navigation of navigations) {
      await db.query(
        `
        INSERT INTO navigations (participant_id, id, type, start_at, duration, route, starting_location_id, ending_location_id)
        SELECT $1, $2, type, start_at, duration, route, starting_location_id, ending_location_id
        FROM navigations
        WHERE navigations.id = $3
      `,
        [createdParticipant.id, uuidv4(), navigation.id],
      );
    }

    return context.dataLoaders.tripLoader.load(createdTrip.id);
  } catch (error) {
    captureException(error);
    return new Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: Trip,
  args: {
    tripId: {
      type: GraphQLID,
    },
  },
  resolve: duplicateTrip,
};
