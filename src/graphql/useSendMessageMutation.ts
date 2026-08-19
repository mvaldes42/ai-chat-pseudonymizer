import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { SendMessageMutationType, SendMessageType } from "../types";

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutationType,
  SendMessageType
> = gql`
  mutation SendMessage($streamId: ID!, $content: String!) {
    sendMessage(streamId: $streamId, content: $content) {
      streamId
      content
    }
  }
`;

export function useSendMessageMutation() {
  return useMutation(SEND_MESSAGE_MUTATION);
}
