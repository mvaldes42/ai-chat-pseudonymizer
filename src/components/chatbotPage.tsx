import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import { useAssistantStream } from "./hooks/useAssistantStream";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, storePiiMapping } from "../store/messagesSlice";
import type { RootState } from "../store/store";
import { piiDetectAndReplace } from "./utils/piiDetectAndReplace";
import { PiiMappingType } from "../types";

export function ChatbotPage() {
  const dispatch = useDispatch();
  const { isStreaming, lastResponseId, requestAssistantReply } =
    useAssistantStream();
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

  async function handleSendMessage({ content }: { content: string }) {
    const { result: pseudonymizedContent, mapping } = await piiDetectAndReplace(
      { content, piiOccurrencesCount, piiMappingList },
    );

    dispatch(
      addMessage({
        content,
        sender: "user",
      }),
    );

    const mappingForDecode =
      mapping && mapping.length > 0
        ? [...piiMappingList, ...mapping]
        : piiMappingList;

    if (mapping && mapping.length > 0) {
      dispatch(storePiiMapping(mapping));
    }

    requestAssistantReply({
      content: pseudonymizedContent,
      previousResponseId: lastResponseId,
      piiMappingList: mappingForDecode,
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
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar name="assistant" src={getAvatar("assistant")} />
            <ConversationHeader.Content userName="assistant" />
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
                      src={getAvatar(message.sender)}
                    />
                  </Message>
                );
              })}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            disabled={isStreaming}
            onSend={async (message) =>
              await handleSendMessage({ content: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

function getAvatar(sender: string) {
  return sender === "assistant"
    ? "https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
    : "https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg";
}
