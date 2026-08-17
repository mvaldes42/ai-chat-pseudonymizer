import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
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
  MessageSeparator,
  Avatar,
} from "@chatscope/chat-ui-kit-react";

export function ChatbotPage() {
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
            <MessageSeparator content="Saturday, 30 November 2019" />
            <Message
              model={{
                direction: "incoming",
                message: "Hello my friend",
                position: "single",
                sender: "OpenAI",
              }}
            >
              <Avatar
                name="OpenAI"
                src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
              />
            </Message>
          </MessageList>
          <MessageInput placeholder="Type message here" attachButton={false} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
