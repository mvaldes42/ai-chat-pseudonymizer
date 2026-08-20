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

export type TokenType = {
  index: number;
  word: string;
};

export type NerTokenType = TokenType & {
  entity: string;
};

export type PiiGroupType = {
  type: string;
  words: string[];
  indexes: number[];
};

export type PiiSpanType = {
  type: string;
  start: number;
  end: number;
  value: string;
};
