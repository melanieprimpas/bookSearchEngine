import { Book, User } from '../models/index.js';

const resolvers = {
  Query: {
    books: async () => {
      try {
        return await Book.find({})
      } catch (error) {
        console.error('Error fetching book data: ', error);
        throw new Error('Failed to fetch book data');
      }
    },
    users: async () => {
      try {
        // Populate the savedBooks subdocument when querying for users
        return await User.find({}).populate('savedBooks');
      } catch (error) {
        console.error('Error fetching user data: ', error);
        throw new Error('Failed to fetch user data');
      }
    },
  },
};

export default resolvers;
