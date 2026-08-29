import { useApolloClient } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addAssistantMessage } from '../../store/messagesSlice'
import type { AssistantStreamRequestType } from '../../types'
import { streamAssistantMessage } from '../utils/streamAssistantMessage'

export function useAssistantStream() {
  const client = useApolloClient()
  const dispatch = useDispatch()
  const [request, setRequest] = useState<AssistantStreamRequestType | null>(
    null,
  )
  const [lastResponseId, setLastResponseId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    if (!request) {
      return
    }

    const { content, previousResponseId, piiMappingList } = request

    const controller = new AbortController()
    setIsStreaming(true)

    streamAssistantMessage({
      client,
      content,
      previousResponseId,
      piiMappingList,
      signal: controller.signal,
      onDecoded: (decoded) => {
        dispatch(addAssistantMessage(decoded))
      },
    }).then((responseId) => {
      if (controller.signal.aborted) {
        return
      }
      if (responseId) {
        setLastResponseId(responseId)
      }
      setRequest(null)
      setIsStreaming(false)
    })

    return () => {
      controller.abort()
    }
  }, [request, client, dispatch])

  return {
    isStreaming,
    lastResponseId,
    requestAssistantReply: setRequest,
  }
}
