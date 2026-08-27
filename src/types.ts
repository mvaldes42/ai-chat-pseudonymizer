export type SenderType = "user" | "assistant";

export type MessageType = {
  id: number;
  messageId: string;
  content: string;
  sender: SenderType;
  userMessageId?: string | null;
};

export type MessagesState = {
  messageList: MessageType[];
  piiMappingList: PiiMappingReduxType[];
};

export type SendMessageMutationType = {
  sendMessage: {
    content: string;
    messageId: string;
    userMessageId?: string | null;
    responseId: string;
  };
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

export type PiiMapping = Record<string, string> | undefined;

export type PiiMappingReduxType = {
  id: number;
  messageId: string;
  mapping: PiiMapping;
};
