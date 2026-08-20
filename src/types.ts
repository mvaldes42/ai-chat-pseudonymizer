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

export type NerTokenType = {
  entity: string;
  word: string;
  index: number;
};

export type PiiGroupType = {
  type: string;
  words: string[];
  indexes: number[];
};

export type TokenType = {
  index: number;
  word: string;
};
