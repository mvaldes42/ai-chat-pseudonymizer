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
import { v4 as uuidv4 } from "uuid";

export function ChatbotPage() {
  const [streamId, setStreamId] = useState(uuidv4());
  const [sendMessage, { data: response, error }] = useSendMessageMutation();
  const [messageList, setMessageList] = useState<
    { id: number; content: string; sender: string }[]
  >([]);

  function addMessage(content: string, sender: string) {
    setMessageList(
      (prev: { id: number; content: string; sender: string }[]) => [
        ...prev,
        { id: prev?.length + 1 || 0, content, sender },
      ],
    );
  }

  useEffect(() => {
    if (response?.sendMessage?.content) {
      addMessage(response?.sendMessage?.content, "OpenAI");
    }
  }, [response]);

  function handleSendMessage({
    streamId,
    content,
  }: {
    streamId: string;
    content: string;
  }) {
    sendMessage({ variables: { streamId, content } });
    addMessage(content, "User");
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
