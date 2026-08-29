import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
} from '@chatscope/chat-ui-kit-react'
import { useEffect } from 'react'
import { useAssistantStream } from './hooks/useAssistantStream'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, storePiiMapping } from '../store/messagesSlice'
import type { RootState } from '../store/store'
import {
  piiDetectAndReplace,
  preloadPiiPipeline,
} from './utils/piiDetectAndReplace'
import { placeholderInText } from './utils/parsePlaceholder'

export function ChatbotPage() {
  const dispatch = useDispatch()
  const { isStreaming, lastResponseId, requestAssistantReply } =
    useAssistantStream()
  const piiOccurrencesCount = useSelector(
    (state: RootState) => state.messages.piiOccurrencesCount,
  )
  const messageList = useSelector(
    (state: RootState) => state.messages.messageList,
  )
  const piiMappingList = useSelector(
    (state: RootState) => state.messages.piiMappingList,
  )

  useEffect(() => {
    void preloadPiiPipeline()
  }, [])

  async function handleSendMessage({ input }: { input: string }) {
    const { result: codedContent, mapping } = await piiDetectAndReplace({
      content: input,
      piiOccurrencesCount,
      piiMappingList,
    })

    dispatch(
      addMessage({
        decodedContent: input,
        codedContent,
        sender: 'user',
      }),
    )

    const mappingForDecode =
      mapping && mapping.length > 0
        ? [...piiMappingList, ...mapping]
        : piiMappingList

    if (mapping && mapping.length > 0) {
      dispatch(storePiiMapping(mapping))
    }

    requestAssistantReply({
      content: codedContent,
      previousResponseId: lastResponseId,
      piiMappingList: mappingForDecode,
    })
  }

  function getPiiInfo(content: string) {
    const placeholders = new Set<string>()
    for (const match of content.matchAll(placeholderInText())) {
      placeholders.add(match[0])
    }
    return piiMappingList.filter((mapping) =>
      placeholders.has(mapping.placeholder),
    )
  }

  return (
    <div className="w-100 h-100 relative">
      <MainContainer
        responsive
        style={{
          height: '600px',
        }}
      >
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar name="assistant" src={getAvatar('assistant')} />
            <ConversationHeader.Content userName="assistant" />
            <ConversationHeader.Actions></ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList>
            {messageList?.length > 0 &&
              messageList.map((message) => {
                const piiInfo = getPiiInfo(message.codedContent ?? '')
                const showCoded =
                  Boolean(message.codedContent) &&
                  message.codedContent !== message.decodedContent
                return (
                  <Message
                    key={message.id}
                    model={{
                      direction:
                        message.sender === 'assistant'
                          ? 'incoming'
                          : 'outgoing',
                      message: message.decodedContent,
                      position: 'single',
                      sender: message.sender,
                    }}
                  >
                    {(piiInfo.length > 0 || showCoded) && (
                      <Message.Footer>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            textAlign: 'left',
                          }}
                        >
                          {piiInfo.length > 0 && (
                            <div>
                              {piiInfo.map((mapping, index) => (
                                <span key={mapping.placeholder}>
                                  {mapping.placeholder}: {mapping.value}
                                  {index < piiInfo.length - 1 && (
                                    <span>&nbsp;-&nbsp;</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                          {showCoded && <div>{message.codedContent}</div>}
                        </div>
                      </Message.Footer>
                    )}
                    <Avatar
                      name={message.sender}
                      src={getAvatar(message.sender)}
                    />
                  </Message>
                )
              })}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            disabled={isStreaming}
            onSend={async (message) =>
              await handleSendMessage({ input: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

function getAvatar(sender: string) {
  return sender === 'assistant'
    ? 'https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg'
    : 'https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg'
}
