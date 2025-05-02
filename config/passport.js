// config/passport.js

import passport from 'passport';
import { GraphQLLocalStrategy } from 'graphql-passport';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

export const configurePassport = () => {
  // Serialize user
  passport.serializeUser((user, done) => {
    try {
      if (!user || !user._id) {
        return done(new Error('Invalid user object'));
      }
      console.log('Serializing user:', user._id.toString());
      done(null, user._id.toString());
    } catch (error) {
      done(error);
    }
  });
  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
    try {
      const user = await User.findById(id);
      console.log('user', user);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // GraphQL Local Strategy
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const phoneNumber = username; // Using username param for phoneNumber

        console.log('Searching for user with phone number:', phoneNumber); // Debug log
        const user = await User.findOne({ phoneNumber });
        console.log('Found user:', user); // Debug log
        if (!user) {
          return done(null, false, {
            message: 'Invalid phoneNumber or password',
          });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, {
            message: 'Invalid phoneNumber or password',
          });
        }

        // Success: pass the user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
