import type { ApolloClient } from "@apollo/client";
import type { PiiMappingType } from "../../types";
import { subscribeMessageStream } from "../../graphql/subscribeMessageStream";
import { decodeString } from "./decodeString";

function errorMessage(error: any) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to stream the assistant response.";
}

export async function streamAssistantMessage({
  client,
  content,
  previousResponseId,
  piiMappingList,
  onDecoded,
  signal,
}: {
  client: ApolloClient;
  content: string;
  previousResponseId: string | null;
  piiMappingList: PiiMappingType[];
  onDecoded: (decoded: string) => void;
  signal?: AbortSignal;
}): Promise<string | null> {
  let accumulated = "";

  return subscribeMessageStream({
    client,
    content,
    previousResponseId,
    signal,
    onChunk: (chunk) => {
      if (chunk.delta) {
        const nextAccumulated = accumulated + chunk.delta;
        const result = {
          accumulated: nextAccumulated,
          decoded: decodeString({
            content: nextAccumulated,
            piiMappingList,
          }),
        };

        accumulated = result.accumulated;
        onDecoded(result.decoded);
      }

      if (chunk.done && chunk.error && !accumulated) {
        onDecoded(chunk.error);
      }
    },
    onError: (error) => {
      if (!accumulated) {
        onDecoded(errorMessage(error));
      }
    },
  });
}
