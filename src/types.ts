export type SenderType = "user" | "assistant";

export type MessageType = {
  id?: number;
  content: string;
  sender: SenderType;
};

export type PiiOccurrenceCountType = { type: string; count: number };

export type MessagesState = {
  messageList: MessageType[];
  piiMappingList: PiiMappingType[];
  piiOccurrencesCount: PiiOccurrenceCountType[];
};

export type SendMessageMutationType = {
  sendMessage: {
    content: string;
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
};

export type PiiSpanType = {
  type: string;
  start: number;
  end: number;
  value: string;
  placeholder: string | null;
  alreadyMapped: boolean;
};

export type PiiMappingType = {
  placeholder: string;
  value: string;
};
