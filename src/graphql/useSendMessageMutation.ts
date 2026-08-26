import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { SendMessageMutationType, MessageType } from "../types";

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutationType,
  MessageType
> = gql`
  mutation SendMessage($streamId: ID!, $content: String!, $userMessageId: ID!) {
    sendMessage(
      streamId: $streamId
      content: $content
      userMessageId: $userMessageId
    ) {
      streamId
      content
      messageId
      userMessageId
    }
  }
`;

export function useSendMessageMutation() {
  return useMutation(SEND_MESSAGE_MUTATION);
}
