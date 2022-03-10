// @flow
import { GraphQLString, GraphQLNonNull } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailValidator from 'email-validator';
import db from 'db';

import { TOKEN_SECRET } from 'config/api';

import captureException from 'helpers/captureException';

type Args = {
  email: string,
  password: string,
};

const register = async (parent: any, args: Args) => {
  try {
    // Check if email and password are valid
    if (!emailValidator.validate(args.email)) return Error('EMAIL_NOT_VALID');
    if (args.password.length < 6) return Error('PASSWORD_TOO_SHORT');

    // Check if email already exists
    const checkEmailResult = await db.query(
      `
      SELECT id
      FROM accounts
      WHERE email = $1
      `,
      [args.email],
    );
    if (checkEmailResult.rows[0]) return Error('EMAIL_ALREADY_EXISTS');

    // Generate hash for the password (automatically generates salt)
    const hash = await bcrypt.hash(args.password, 10);

    // Create user
    const insertResult = await db.query(
      `
      INSERT INTO accounts (email, password, created_at)
      VALUES ($1, $2, now())
      RETURNING *
      `,
      [args.email, hash],
    );
    const [createdUser] = insertResult.rows;

    // Generate JWT token
    const tokenPayload = { id: createdUser.id };
    const token = jwt.sign(tokenPayload, TOKEN_SECRET);

    return `Bearer ${token}`;
  } catch (error) {
    captureException(error);
    return Error('SOMETHING_WENT_WRONG');
  }
};

export default {
  type: GraphQLString,
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve: register,
};
