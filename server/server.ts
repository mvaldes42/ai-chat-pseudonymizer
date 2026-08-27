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
import OpenAI from "openai";

const resolvers = {
  Query: {
    health: () => true,
  },
  Mutation: {
    sendMessage: async (
      _: any,
      { content, messageId: userMessageId, previousResponseId }: MessageType,
    ): Promise<SendMessageResponseType> => {
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const messageId = uuidv4();

      const response = await client.responses.create({
        model: "gpt-5-nano",
        instructions: `You are a helpful assistant that can answer questions. Private information inside the user's messages are pseudonymized with placeholder such as [PERSON_x], [LOCATION_x], [EMAIL_ADDRESS_x], etc.
        When answering, do not replace the placeholder, act as if the placeholder is the actual information.
        Do not invent new placeholders for private information, only use the placeholders that are already in the user's message.`,
        max_output_tokens: 1500,
        previous_response_id: previousResponseId,
        input: content,
      });

      console.log(response);

      return {
        content: response.output_text,
        messageId,
        userMessageId,
        responseId: response.id,
      };
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
