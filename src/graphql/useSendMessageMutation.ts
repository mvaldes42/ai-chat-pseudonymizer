import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { SendMessageMutationType } from "../types";

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutationType,
  { content: string; messageId: string | null }
> = gql`
  mutation SendMessage($content: String!, $messageId: ID) {
    sendMessage(content: $content, messageId: $messageId) {
      content
      userMessageId
    }
  }
`;

export function useSendMessageMutation() {
  return useMutation(SEND_MESSAGE_MUTATION);
}
