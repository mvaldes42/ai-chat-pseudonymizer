import { ApolloClient } from '@apollo/client'
import type { MessageChunkType } from '../types'
import { MESSAGE_STREAM_SUBSCRIPTION } from './messageStreamSubscription'

export function subscribeMessageStream({
  client,
  content,
  previousResponseId,
  onChunk,
  onError,
  signal,
}: {
  client: ApolloClient
  content: string
  previousResponseId: string | null
  onChunk: (chunk: MessageChunkType) => void
  onError?: (error: unknown) => void
  signal?: AbortSignal
}): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    let settled = false

    const finish = (responseId: string | null) => {
      if (settled) {
        return
      }
      settled = true
      signal?.removeEventListener('abort', onAbort)
      subscription.unsubscribe()
      resolve(responseId)
    }

    const onAbort = () => finish(null)

    const fail = (error: unknown) => {
      onError?.(error)
      finish(null)
    }

    const subscription = client
      .subscribe({
        query: MESSAGE_STREAM_SUBSCRIPTION,
        variables: { content, previousResponseId },
      })
      .subscribe({
        next: ({ data, error }) => {
          if (error) {
            fail(error)
            return
          }

          const chunk = data?.messageStream
          if (!chunk) {
            return
          }

          onChunk(chunk)

          if (chunk.done) {
            finish(chunk.responseId ?? null)
          }
        },
        error: fail,
      })

    if (signal?.aborted) {
      finish(null)
      return
    }
    signal?.addEventListener('abort', onAbort)
  })
}
