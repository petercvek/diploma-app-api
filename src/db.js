// @flow
import { Pool } from 'pg';

import captureException from 'helpers/captureException';

const pool = new Pool({
  host: 'ec2-3-248-87-6.eu-west-1.compute.amazonaws.com',
  user: 'ogmlgazgglezzn',
  password: 'e76bb3fc23de467131ab7b72edcdf88cffe247ddfd4d9fff6d080adf6a07f515',
  database: 'd4gn0jtbh8d9d',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default {
  query: async (text: string, params?: Array<any>): Promise<any> => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      client.release();
      return result;
    } catch (err) {
      client.release();
      captureException(err);
      throw err;
    }
  },
};
