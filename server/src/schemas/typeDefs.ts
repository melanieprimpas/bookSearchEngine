const typeDefs = `
  type Book {
    bookId: String!
    authors: [String]
    description: String!
    image: String
    link: String
    title: String!
  }
  input BookInput {
    authors: [String]
    description: String
    title: String!
    bookId: String!
    image: String
    link: String
  } 

  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
    
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
  } 
  
  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    addUser(input: UserInput!): Auth
    login(email: String!, password: String!): Auth

    saveBook(input: BookInput!): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;
