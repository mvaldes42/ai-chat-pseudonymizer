import { gql, TypedDocumentNode } from '@apollo/client'
import type { MessageStreamSubscriptionType } from '../types'

export const MESSAGE_STREAM_SUBSCRIPTION: TypedDocumentNode<
  MessageStreamSubscriptionType,
  {
    content: string
    previousResponseId: string | null
  }
> = gql`
  subscription MessageStream($content: String!, $previousResponseId: String) {
    messageStream(content: $content, previousResponseId: $previousResponseId) {
      delta
      done
      responseId
      error
    }
  }
`
