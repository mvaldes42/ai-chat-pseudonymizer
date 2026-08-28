import { useApolloClient } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setStreamingAssistantContent } from "../../store/messagesSlice";
import type { PiiMappingType } from "../../types";
import { streamAssistantMessage } from "../utils/streamAssistantMessage";

export type AssistantStreamRequest = {
  content: string;
  previousResponseId: string | null;
  piiMappingList: PiiMappingType[];
};

export function useAssistantStream() {
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [request, setRequest] = useState<AssistantStreamRequest | null>(null);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!request) {
      return;
    }

    const controller = new AbortController();
    setIsStreaming(true);

    streamAssistantMessage({
      client,
      content: request.content,
      previousResponseId: request.previousResponseId,
      piiMappingList: request.piiMappingList,
      signal: controller.signal,
      onDecoded: (decoded) => {
        dispatch(setStreamingAssistantContent(decoded));
      },
    }).then((responseId) => {
      if (controller.signal.aborted) {
        return;
      }
      if (responseId) {
        setLastResponseId(responseId);
      }
      setRequest(null);
      setIsStreaming(false);
    });

    return () => {
      controller.abort();
    };
  }, [request, client, dispatch]);

  return {
    isStreaming,
    lastResponseId,
    requestAssistantReply: setRequest,
  };
}
