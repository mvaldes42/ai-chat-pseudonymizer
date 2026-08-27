import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { SendMessageMutationType } from "../types";

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutationType,
  {
    content: string;
    messageId: string | null;
    previousResponseId: string | null;
  }
> = gql`
  mutation SendMessage(
    $content: String!
    $messageId: ID
    $previousResponseId: String
  ) {
    sendMessage(
      content: $content
      messageId: $messageId
      previousResponseId: $previousResponseId
    ) {
      content
      userMessageId
      responseId
    }
  }
`;

export function useSendMessageMutation() {
  return useMutation(SEND_MESSAGE_MUTATION);
}
