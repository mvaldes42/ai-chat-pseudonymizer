export type MessageType = {
  content: string;
  messageId?: string | null;
};

export type SendMessageResponseType = {
  content: string;
  messageId: string;
  userMessageId?: string | null;
};

export const typeDefs = `#graphql
  # GraphQL requires a Query type. health is a simple liveness check.
  type Query {
    health: Boolean!
  }

  type SendMessageResponse {
    content: String!
    messageId: ID!
    userMessageId: ID
  }

  # Client generates streamId, then sends only the already-pseudonymized
  # message. Original PII must never appear in this payload.
  type Mutation {
    sendMessage(content: String!, messageId: ID): SendMessageResponse!
  }
`;
