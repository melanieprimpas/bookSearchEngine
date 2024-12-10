// import gql from @apollo/client
import { gql } from '@apollo/client';

// Use the gql function to access the thoughts entrypoint and export it
export const GET_ME = gql`
  query me {
    _id
    username
    email
    savedBooks
    bookCount
  }
`;
