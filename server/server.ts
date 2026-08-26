import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { MessageType, SendMessageResponseType, typeDefs } from "./types";
import { v4 as uuidv4 } from "uuid";

const resolvers = {
  Query: {
    health: () => true,
  },
  Mutation: {
    sendMessage: (
      _: any,
      { streamId, content, userMessageId }: MessageType,
    ): SendMessageResponseType => {
      const messageId = uuidv4();
      const response =
        "Hello [PERSON_1] and [PERSON_2]! Would you like weather reports for [LOCATION_1] and [LOCATION_2]? I can send it to you on your email address: [EMAIL_ADDRESS_1].";
      return { streamId, content: response, messageId, userMessageId };
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
