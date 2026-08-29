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
  onContent,
  signal,
}: {
  client: ApolloClient
  content: string
  previousResponseId: string | null
  piiMappingList: PiiMappingType[]
  onContent: (next: { decodedContent: string; codedContent: string }) => void
  signal?: AbortSignal
}): Promise<string | null> {
  let accumulated = ''

  const publish = (codedContent: string) => {
    onContent({
      decodedContent: decodeString({
        input: codedContent,
        piiMappingList,
      }),
      codedContent,
    })
  }

  const publishError = (message: string) => {
    publish(accumulated ? `${accumulated}\n\n${message}` : message)
  }

  return subscribeMessageStream({
    client,
    content,
    previousResponseId,
    signal,
    onChunk: (chunk) => {
      if (chunk.delta) {
        accumulated += chunk.delta
        publish(accumulated)
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
