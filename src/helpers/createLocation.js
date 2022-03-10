// @flow
import db from 'db';

import captureException from 'helpers/captureException';

type LocationData = {
  id: string,
  name: string,
  latitude: string,
  longitude: string,
};

const createLocation = async (locationData: LocationData) => {
  try {
    const result = await db.query(
      `
      INSERT INTO locations (id, name, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [locationData.id, locationData.name, locationData.latitude, locationData.longitude],
    );
    const [newLocation] = result.rows;

    return newLocation.id;
  } catch (error) {
    captureException(error);
  }
};

export default createLocation;
