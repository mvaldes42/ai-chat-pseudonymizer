import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

type SendMessageMutation = {
  sendMessage: {
    streamId: string;
    content: string;
  };
};

type SendMessageMutationVariables = {
  streamId: string;
  content: string;
};

const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  SendMessageMutation,
  SendMessageMutationVariables
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
