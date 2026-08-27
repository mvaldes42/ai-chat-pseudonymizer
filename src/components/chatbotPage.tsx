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
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addMessage, storePiiMapping } from "../store/messagesSlice";
import type { RootState } from "../store/store";
import { piiDetectAndReplace } from "./utils/piiDetectAndReplace";
import { decodeChatbotMessage } from "./utils/decodeChatbotMessage";

export function ChatbotPage() {
  const [sendMessage, { data: response }] = useSendMessageMutation();
  const dispatch = useDispatch();
  const messageList = useSelector(
    (state: RootState) => state.messages.messageList,
  );
  const piiMappingList = useSelector(
    (state: RootState) => state.messages.piiMappingList,
  );

  useEffect(() => {
    // Decode the response from the assistant
    if (
      response?.sendMessage?.content &&
      response?.sendMessage?.userMessageId
    ) {
      const { content, userMessageId, messageId } = response.sendMessage;

      const decodedContent = decodeChatbotMessage({
        content,
        userMessageId,
        piiMappingList,
      });

      dispatch(
        addMessage({
          content: decodedContent,
          sender: "assistant",
          messageId,
          userMessageId,
        }),
      );
    }
  }, [response, dispatch, piiMappingList]);

  async function handleSendMessage({ content }: { content: string }) {
    // Handle a message sent by the user
    const messageId = uuidv4();
    const { result: pseudonymizedContent, mapping } =
      await piiDetectAndReplace(content);

    dispatch(
      addMessage({
        content,
        sender: "user",
        messageId,
      }),
    );
    dispatch(storePiiMapping({ messageId, mapping }));

    sendMessage({
      variables: { content: pseudonymizedContent, messageId },
    });
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
                      message.sender === "assistant" ? "incoming" : "outgoing",
                    message: message.content,
                    position: "single",
                    sender: message.sender,
                  }}
                >
                  <Avatar
                    name={message.sender}
                    src={
                      message.sender === "assistant"
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
              await handleSendMessage({ content: message })
            }
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
