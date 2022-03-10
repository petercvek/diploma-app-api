// @flow
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { TOKEN_SECRET } from 'config/api';
import db from 'db';
import captureException from 'helpers/captureException';

// Options for jwtStrategy
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: TOKEN_SECRET,
  algorithms: ['HS256'],
};

type TokenPayload = {
  id: string,
};

//
// Create jwtStrategy which is called on every protected route
//
const jwtStrategy = new JwtStrategy(options, async (tokenPayload: TokenPayload, done: Function) => {
  try {
    const result = await db.query(
      `
      SELECT id
      FROM accounts
      WHERE id = $1
      `,
      [tokenPayload.id],
    );
    const [user] = result.rows;

    // If user cannot be found
    if (!user) return done(null, false);

    return done(null, user);
  } catch (error) {
    captureException(error);
    return done(error, false);
  }
});

export { jwtStrategy };
