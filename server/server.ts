import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";

const typeDefs = `#graphql
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

const resolvers = {
  Query: {
    health: () => true,
  },
  Mutation: {
    sendMessage: (
      _: any,
      { streamId, content }: { streamId: string; content: string },
    ) => {
      const response = "This is a test response";
      return { streamId, content: response };
    },
  },
};

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });
// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);
// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);
// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
await server.start();
app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server),
);
const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}/graphql`);
});
