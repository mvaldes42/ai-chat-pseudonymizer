import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  ConversationHeader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import { useSendMessageMutation } from "../graphql/useSendMessageMutation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, storePiiMapping } from "../store/messagesSlice";
import type { RootState } from "../store/store";
import { piiDetectAndReplace } from "./utils/piiDetectAndReplace";
import { decodeChatbotMessage } from "./utils/decodeChatbotMessage";
import { PiiMappingType } from "../types";

export function ChatbotPage() {
  const [sendMessage, { data: response }] = useSendMessageMutation();
  const dispatch = useDispatch();
  const piiOccurrencesCount = useSelector(
    (state: RootState) => state.messages.piiOccurrencesCount,
  );
  const messageList = useSelector(
    (state: RootState) => state.messages.messageList,
  );
  const piiMappingList = useSelector(
    (state: RootState) => state.messages.piiMappingList,
  );
  const lastMessage = messageList[messageList.length - 1];
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);

  useEffect(() => {
    // Decode the response from the assistant
    if (response?.sendMessage?.content && response?.sendMessage?.responseId) {
      const { content } = response.sendMessage;

      const decodedContent = decodeChatbotMessage({
        content,
        piiMappingList,
      });

      setLastResponseId(response.sendMessage.responseId);

      dispatch(
        addMessage({
          content: decodedContent,
          sender: "assistant",
        }),
      );
    }
  }, [response, dispatch, piiMappingList]);

  async function handleSendMessage({ content }: { content: string }) {
    // content = "My name is John Smith and I live in Paris";
    const { result: pseudonymizedContent, mapping } = await piiDetectAndReplace(
      { content, piiOccurrencesCount, piiMappingList },
    );

    dispatch(
      addMessage({
        content,
        sender: "user",
      }),
    );

    if (mapping && mapping.length > 0) {
      dispatch(storePiiMapping(mapping));
    }

    sendMessage({
      variables: {
        content: pseudonymizedContent,
        previousResponseId: lastResponseId,
      },
    });
  }

  function getPiiInfo(content: string) {
    const piiInfo: PiiMappingType[] = [];

    for (const mapping of piiMappingList) {
      if (content.includes(mapping.value)) {
        piiInfo.push(mapping);
      }
    }
    return piiInfo;
  }

  return (
    <div className="w-100 h-100 relative">
      <MainContainer
        responsive
        style={{
          height: "600px",
        }}
      >
        <Sidebar position="left">
          <Search placeholder="Search..." />
          <ConversationList>
            {lastMessage && (
              <Conversation
                info={lastMessage.content}
                lastSenderName={lastMessage.sender}
                name={lastMessage.sender}
              >
                <Avatar
                  name={lastMessage.sender}
                  src={
                    lastMessage.sender === "assistant"
                      ? "https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                      : "https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg"
                  }
                />
              </Conversation>
            )}
          </ConversationList>
        </Sidebar>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar
              name="OpenAI"
              src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
            />
            <ConversationHeader.Content userName="OpenAI" />
            <ConversationHeader.Actions></ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList>
            {messageList?.length > 0 &&
              messageList.map((message) => {
                const piiInfo = getPiiInfo(message.content);
                return (
                  <Message
                    key={message.id}
                    model={{
                      direction:
                        message.sender === "assistant"
                          ? "incoming"
                          : "outgoing",
                      message: message.content,
                      position: "single",
                      sender: message.sender,
                    }}
                  >
                    <Message.Footer>
                      {piiInfo &&
                        piiInfo.map((mapping, index) => (
                          <span key={mapping.placeholder}>
                            {mapping.placeholder}: {mapping.value}
                            {index < piiInfo.length - 1 && (
                              <span>&nbsp;-&nbsp;</span>
                            )}
                          </span>
                        ))}
                    </Message.Footer>
                    <Avatar
                      name={message.sender}
                      src={
                        message.sender === "assistant"
                          ? "https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                          : "https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg"
                      }
                    />
                  </Message>
                );
              })}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            onSend={async (message) =>
              await handleSendMessage({ content: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
