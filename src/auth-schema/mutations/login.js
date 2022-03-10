// @flow
import { GraphQLString, GraphQLNonNull } from 'graphql';
import jwt from 'jsonwebtoken';
import emailValidator from 'email-validator';
import bcrypt from 'bcryptjs';
import db from 'db';

import { TOKEN_SECRET, ADMIN_PASSWORD } from 'config/api';

import captureException from 'helpers/captureException';

type Args = {
  email: string,
  password: string,
};

const login = async (parent: any, args: Args) => {
  try {
    if (!emailValidator.validate(args.email)) return Error('USER_OR_EMAIL_WRONG');
    if (args.password.length < 1) return Error('USER_OR_EMAIL_WRONG');

    const findEmailResult = await db.query(
      `
      SELECT id, email, password
      FROM accounts
      WHERE email = $1
      `,
      [args.email],
    );

    const user = findEmailResult.rows[0];
    if (!user) return Error('USER_OR_EMAIL_WRONG');

    // Check if in admin mode
    if (args.password === ADMIN_PASSWORD) {
      // Generate JWT token
      const tokenPayload = { id: user.id, isUrbi: true };
      const token = jwt.sign(tokenPayload, TOKEN_SECRET);

      return `Bearer ${token}`;
    }

    const correct = await bcrypt.compare(args.password, user.password);
    if (!correct) return Error('USER_OR_EMAIL_WRONG');

    // Generate JWT token
    const tokenPayload = { id: user.id };
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
  resolve: login,
};
