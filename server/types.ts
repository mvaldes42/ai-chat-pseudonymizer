export type SendMessageType = {
  streamId: string;
  content: string;
};

export const typeDefs = `#graphql
  # GraphQL requires a Query type. health is a simple liveness check.
  type Query {
    health: Boolean!
  }

  type SendMessageResponse {
    streamId: ID!
    content: String!
  }

  # Client generates streamId, then sends only the already-pseudonymized
  # message. Original PII must never appear in this payload.
  type Mutation {
    sendMessage(streamId: ID!, content: String!): SendMessageResponse!
  }
`;
