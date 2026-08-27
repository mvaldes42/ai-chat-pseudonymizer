import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { SendMessageMutationType } from "../types";

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutationType,
  {
    content: string;
    previousResponseId: string | null;
  }
> = gql`
  mutation SendMessage($content: String!, $previousResponseId: String) {
    sendMessage(content: $content, previousResponseId: $previousResponseId) {
      content
      responseId
    }
  }
`;

export function useSendMessageMutation() {
  return useMutation(SEND_MESSAGE_MUTATION);
}
