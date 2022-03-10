// @flow
import 'babel-polyfill';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import bodyParser from 'body-parser';
import passport from 'passport';
import compression from 'compression';
import morgan from 'morgan';
import morganGraphql from 'morgan-graphql';
import cors from 'cors';

import AuthSchema from 'auth-schema';
import Schema from 'schema';
import getDataLoaders from 'dataLoaders';
import { jwtStrategy } from 'middleware/auth';

const server = express();

// Initialize passport
passport.use(jwtStrategy);
server.use(passport.initialize());

server.use(bodyParser.json({ limit: '200mb' }));
server.use(compression());
server.use(cors());

// Configure morgan to log requests
morgan.token('graphql-query', morganGraphql);
server.use(morgan(':method :url :status :response-time[0]ms :date[iso] :graphql-query'));

//
// Home route
//
server.get('/', (req, res) => {
  res.send('Welcome to Influee API!');
});

//
// Health check to confirm liveness of the probe
// @GET /healthz
//
server.get('/healthz', (req, res) => {
  res.send('Health OK!');
});

//
// Use this schema for auth
// @ POST /auth
//
server.use(
  '/auth',
  graphqlHTTP({
    schema: AuthSchema,
    graphiql: process.env.NODE_ENV !== 'production',
  }),
);

//
// Use this schema for everything
// @ POST /graphql
//
server.use(
  '/graphql',
  passport.authenticate('jwt', { session: false }),
  graphqlHTTP(req => {
    const dataLoaders = getDataLoaders();

    return {
      schema: Schema,
      graphiql: process.env.NODE_ENV !== 'production',
      context: { user: req.user, dataLoaders },
    };
  }),
);

server.listen(2000, async () => {
  console.info('SERVER STARTED: http://localhost:2000');
});
