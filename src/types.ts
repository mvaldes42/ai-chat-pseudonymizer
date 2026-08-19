export type ChatMessageType = {
  id: number;
  content: string;
  sender: string;
};

export type MessagesState = {
  messageList: ChatMessageType[];
};

export type SendMessageType = {
  streamId: string;
  content: string;
};

export type SendMessageMutationType = {
  sendMessage: SendMessageType;
};
