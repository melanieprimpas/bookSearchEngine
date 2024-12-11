import { BookDocument } from '../models/Book.js';
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

// Define types for the arguments
interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
}

interface UserArgs {
  id: string;
  username: string;
}

interface AddUserArgs {
  input:{
    username: string;
    email: string;
    password: string;
  }
}

interface AddBookArgs {
  input: {  
    authors: string[];
    description: string;
    title: string;
    bookId: string;
    image: string;
    link: string;
  }
}

interface RemoveBookArgs {
  bookId: string;
  //book: BookDocument;
}

interface Context {
  user?: User; 
}

const resolvers = {
  Query: {
    //get single user
    me: async (_parent: any, {id, username}: UserArgs, context: Context) => {
      console.log(id)
      console.log(context.user)
      if (!context.user) {
        throw AuthenticationError;
      }

      id = context.user._id;
      username = context.user.username;

      const foundUser = await User.findOne({
        $or: [ { _id: id }, { username }]
      });

      if (!foundUser) {
        throw new Error('Cannot find user with that id or username.')
      }
      return foundUser
      
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs): Promise<{ token: string; user: User }> => {
      try {
      // Check if the user already exists
        const user = await User.create({ ...input });
        const token = signToken(user.username, user.email, user._id);
        return { token, user } 
      } catch (error) {
        throw new Error('Could not create user.')
      }
  
    },
    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      // Find a user by email
      const user = await User.findOne({ email });

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
    saveBook: async (_parent: any, { input }: AddBookArgs, context: Context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in

      if (context.user) {

        // Add a skill to a profile identified by profileId
        try {
          console.log('trying to update')
          return await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true }
          ); 
        } catch (error) {
          throw new Error('Could not add book to user.')
        }
 
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },
    // Make it so a logged in user can only remove a skill from their own profile
    removeBook: async (_parent: unknown, { bookId }: RemoveBookArgs, context: Context): Promise<User | null> => {
  
      if (context.user) {
        // If context has a `user` property, remove a skill from the profile of the logged-in user
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },
  }
};

export default resolvers;
