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
import { addMessage } from "../store/messagesSlice";
import type { RootState } from "../store/store";

export function ChatbotPage() {
  const [streamId, setStreamId] = useState(uuidv4());
  const [sendMessage, { data: response }] = useSendMessageMutation();
  const dispatch = useDispatch();
  const messageList = useSelector(
    (state: RootState) => state.messages.messageList,
  );

  useEffect(() => {
    if (response?.sendMessage?.content) {
      dispatch(
        addMessage({ content: response.sendMessage.content, sender: "OpenAI" }),
      );
    }
  }, [response, dispatch]);

  function handleSendMessage({
    streamId,
    content,
  }: {
    streamId: string;
    content: string;
  }) {
    sendMessage({ variables: { streamId, content } });
    dispatch(addMessage({ content, sender: "User" }));
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
                  key={message.id}
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
            onSend={(message) =>
              handleSendMessage({ streamId, content: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
