// import gql from @apollo/client
import { gql } from '@apollo/client';

// Use the gql function to access me
export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
      bookCount

    }
  }
`;
