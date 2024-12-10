import { gql } from '@apollo/client';

export const SAVE_BOOK = gql`
 mutation saveBook($input: BookInput!) {
    saveBook(input: $input) {
      authors
      description
      title
      bookId
      image
      link
    
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      bookId
      title
      authors
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($input: UserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;