export type MessageType = {
  content: string;
  previousResponseId?: string | null;
};

export type SendMessageResponseType = {
  content: string;
  responseId: string;
};

export const typeDefs = `#graphql
  # GraphQL requires a Query type. health is a simple liveness check.
  type Query {
    health: Boolean!
  }

  type SendMessageResponse {
    content: String!
    responseId: String!
  }

  # Client generates streamId, then sends only the already-pseudonymized
  # message. Original PII must never appear in this payload.
  type Mutation {
    sendMessage(content: String!, previousResponseId: String): SendMessageResponse!
  }
`;
