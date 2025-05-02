import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const userResolver = {
  //
  Mutation: {
    //
    signUp: async (_, { input }, context) => {
      try {
        const { username, password, phoneNumber } = input;

        if (!username || !password || !phoneNumber) {
          throw new Error('All fields are required');
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
          throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          username,
          password: hashedPassword,
          phoneNumber,
        });

        await newUser.save();

        await context.login(newUser);
        return newUser;
      } catch (err) {
        console.log('Error in sign', err);
        throw new Error(err.message || 'Internal server error');
      }
    },
    //
    login: async (_, { input }, context) => {
      try {
        const { phoneNumber, password } = input; // Ensure this is correct

        if (!phoneNumber || !password) {
          throw new Error('All fields are required');
        }

        console.log('Login attempt:', { phoneNumber, password }); // Debug log

        const { user } = await context.authenticate('graphql-local', {
          username: phoneNumber, // Using phoneNumber as the identifier
          password,
        });

        await context.login(user);
        return user;
      } catch (err) {
        console.error('Login error details:', err);
        throw new Error(err.message || 'Authentication failed');
      }
    },
    //
    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw err;
        });
        context.res.clearCookie('connect.sid');

        return { message: 'Logged out successfully' };
      } catch (err) {
        console.error('Error in logout:', err);
        throw new Error(err.message || 'Internal server error');
      }
    },
  },
  //
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.error('Error in authUser:', err);
        throw new Error(err.message || 'Internal server error');
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.error('Error in user query:', err);
        throw new Error(err.message || 'Error getting user');
      }
    },
  },
};

export default userResolver;
