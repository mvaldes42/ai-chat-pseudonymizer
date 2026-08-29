import type { ApolloClient } from '@apollo/client'
import type { PiiMappingType } from '../../types'
import { subscribeMessageStream } from '../../graphql/subscribeMessageStream'
import { decodeString } from './decodeString'

function errorMessage(error: any) {
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to stream the assistant response.'
}

export async function streamAssistantMessage({
  client,
  content,
  previousResponseId,
  piiMappingList,
  onDecoded,
  signal,
}: {
  client: ApolloClient
  content: string
  previousResponseId: string | null
  piiMappingList: PiiMappingType[]
  onDecoded: (decoded: string) => void
  signal?: AbortSignal
}): Promise<string | null> {
  let accumulated = ''

  const publishError = (message: string) => {
    if (!accumulated) {
      onDecoded(message)
      return
    }
    onDecoded(
      `${decodeString({ content: accumulated, piiMappingList })}\n\n${message}`,
    )
  }

  return subscribeMessageStream({
    client,
    content,
    previousResponseId,
    signal,
    onChunk: (chunk) => {
      if (chunk.delta) {
        accumulated += chunk.delta
        onDecoded(
          decodeString({
            content: accumulated,
            piiMappingList,
          }),
        )
      }

      if (chunk.done && chunk.error) {
        publishError(chunk.error)
      }
    },
    onError: (error) => {
      publishError(errorMessage(error))
    },
  })
}
