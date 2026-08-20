export type ChatMessageType = {
  id: number;
  messageId?: string;
  content: string;
  sender: string;
};

export type MessagesState = {
  messageList: ChatMessageType[];
  piiMappingList: PiiMappingEntry[];
};

export type MessageType = {
  streamId: string;
  content: string;
  messageId?: string;
};

export type SendMessageMutationType = {
  sendMessage: MessageType;
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
  placeholder: string;
};

export type PiiSpanType = {
  type: string;
  start: number;
  end: number;
  value: string;
  placeholder: string;
};

export type PiiMapping = Record<string, string>;

export type PiiMappingEntry = {
  id: number;
  userMessageId: string;
  mapping: PiiMapping;
};
