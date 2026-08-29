export type MessageStreamArgs = {
  content: string
  previousResponseId?: string | null
}

export type MessageChunkType = {
  delta?: string | null
  done: boolean
  responseId?: string | null
  error?: string | null
}

export const typeDefs = `#graphql
  # GraphQL requires a Query type. health is a simple liveness check.
  type Query {
    health: Boolean!
  }

  type MessageChunk {
    delta: String
    done: Boolean!
    responseId: String
    error: String
  }

  # Client sends only the already-pseudonymized message.
  # Original PII must never appear in this payload.
  type Subscription {
    messageStream(content: String!, previousResponseId: String): MessageChunk!
  }
`
