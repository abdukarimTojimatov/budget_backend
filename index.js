import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildContext } from 'graphql-passport';
import mergedResolvers from './resolvers/index.js';
import mergedTypeDefs from './typeDefs/index.js';
import { connectDB } from './db/connectDB.js';

// Import Passport config function
import { configurePassport } from './config/passport.js';

dotenv.config();

const __dirname = path.resolve();
const app = express();
const httpServer = http.createServer(app);
const isDevelopment = 'development';

// Ensure the server only runs in development mode
console.log('isDevelopment', process.env.NODE_ENV);
if (!isDevelopment) {
  console.error('❌ Server can only run in development mode.');
  process.exit(1);
}

// Configure session store
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

store.on('error', (err) => {
  console.error('Session store error:', err);
});

// Configure Passport
configurePassport();

// CORS Middleware - Restrict to development origins
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://92.112.180.30:3000'], // Add frontend origins used in development
    credentials: true, // Enable sending cookies/credentials
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Allow unauthenticated sessions for development
    store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false, // No HTTPS in development
      sameSite: 'lax',
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Create Apollo Server with introspection and Playground enabled
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true, // Enable introspection for Playground
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return { message: error.message }; // Show full error messages in development
  },
});

// Start the server
const startServer = async () => {
  try {
    await server.start();

    // Apply Apollo middleware
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => ({
          ...buildContext({ req, res }),
          req,
          res,
          isDevelopment,
        }),
      })
    );

    // Connect to MongoDB and start the server
    await connectDB();
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    console.log('Environment: Development');
    console.log('Playground: Enabled');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
