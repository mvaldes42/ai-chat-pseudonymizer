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
import { v4 as uuidv4 } from "uuid";
import { addMessage, storePiiMapping } from "../store/messagesSlice";
import type { RootState } from "../store/store";
import { MessageType } from "../types";
import { piiDetectAndReplace } from "./utils/piiDetectAndReplace";

export function ChatbotPage() {
  const [streamId] = useState(uuidv4());
  const [sendMessage, { data: response }] = useSendMessageMutation();
  const dispatch = useDispatch();
  const messageList = useSelector(
    (state: RootState) => state.messages.messageList,
  );

  useEffect(() => {
    if (response?.sendMessage?.content) {
      dispatch(
        addMessage({
          content: response.sendMessage.content,
          sender: "OpenAI",
          messageId: response.sendMessage.messageId,
        }),
      );
    }
  }, [response, dispatch]);

  async function handleSendMessage({ streamId, content }: MessageType) {
    content =
      "my name is Jane Smith and my email is jane.smith@example.com. My friend is Lou. I live in Paris and she lives in London.";
    const userMessageId = uuidv4();
    const { result, mapping } = await piiDetectAndReplace(content);

    dispatch(storePiiMapping({ userMessageId, mapping }));
    dispatch(
      addMessage({
        content: content,
        sender: "User",
        messageId: userMessageId,
      }),
    );
    sendMessage({ variables: { streamId, content: result } });
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
            <Conversation
              info="Yes i can do it for you"
              lastSenderName="OpenAI"
              name="OpenAI"
            >
              <Avatar
                name="OpenAI"
                src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
              />
            </Conversation>
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
              messageList.map((message) => (
                <Message
                  key={message.messageId || message.id}
                  model={{
                    direction:
                      message.sender === "OpenAI" ? "incoming" : "outgoing",
                    message: message.content,
                    position: "single",
                    sender: message.sender,
                  }}
                >
                  <Avatar
                    name={message.sender}
                    src={
                      message.sender === "OpenAI"
                        ? "https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                        : "https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg"
                    }
                  />
                </Message>
              ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            onSend={async (message) =>
              await handleSendMessage({ streamId, content: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
