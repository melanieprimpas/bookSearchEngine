import { BookDocument } from '../models/Book.js';
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

// Define types for the arguments
interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  books: BookDocument[];
}

interface UserArgs {
  userId: string;
}

interface AddUserArgs {
  name: string;
}

interface AddBookArgs {
  userId: string;
  book: BookDocument;
}

interface RemoveBookArgs {
  userId: string;
  book: BookDocument;
}

interface Context {
  user?: User; // Optional user profile in context
}

const resolvers = {
  Query: {
    users: async () => {
      try {
        // Populate the savedBooks subdocument when querying for users
        return await User.find({}).populate('savedBooks');
      } catch (error) {
        console.error('Error fetching user data: ', error);
        throw new Error('Failed to fetch user data');
      }
    },
    user: async (_parent: unknown, { userId }: UserArgs) => {
      try {
        // Populate the savedBooks subdocument when querying for user
        return await User.findOne({ _id: userId }).populate('savedBooks');
      } catch (error) {
        console.error('Error fetching user data: ', error);
        throw new Error('Failed to fetch user data');
      } 
    },
    me: async (_parent: any, _args: any, context: Context): Promise<User | null> => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    createUser: async (_parent: unknown, { name }: AddUserArgs) => {
      return await User.create({ name });
    },
    login: async (_parent: unknown, { username, password }: { username: string; password: string }): Promise<{ token: string; user: User }> => {
      // Find a user by email
      const user = await User.findOne({ username });

      if (!user) {
        // If profile with provided email doesn't exist, throw an authentication error
        throw AuthenticationError;
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        // If password is incorrect, throw an authentication error
        throw new AuthenticationError('Not Authenticated');
      }

      // Sign a JWT token for the authenticated profile
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // Add a third argument to the resolver to access data in our `context`
    addBook: async (_parent: unknown, { userId, book }: AddBookArgs, context: Context): Promise<User | null> => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        // Add a skill to a profile identified by profileId
        return await User.findOneAndUpdate(
          { _id: userId },
          {
            $addToSet: { books: book },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },
    // Make it so a logged in user can only remove a skill from their own profile
    removeBook: async (_parent: unknown, { book }: RemoveBookArgs, context: Context): Promise<User | null> => {
      if (context.user) {
        // If context has a `user` property, remove a skill from the profile of the logged-in user
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { books: book } },
          { new: true }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },
  }
};

export default resolvers;
