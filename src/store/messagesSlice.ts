import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessageType, MessagesState, PiiMapping } from "../types";

const initialState: MessagesState = {
  messageList: [],
  piiMappingList: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<ChatMessageType, "id">>) => {
      if (action.payload.sender === "OpenAI" && !action.payload.userMessageId) {
        throw new Error("User message ID is required for OpenAI messages");
      }
      state.messageList.push({
        id: state.messageList.length + 1,
        messageId: action.payload.messageId,
        userMessageId: action.payload.userMessageId,
        content: action.payload.content,
        sender: action.payload.sender,
      });
    },
    storePiiMapping: (
      state,
      action: PayloadAction<{ userMessageId: string; mapping: PiiMapping }>,
    ) => {
      state.piiMappingList.push({
        id: state.piiMappingList.length + 1,
        userMessageId: action.payload.userMessageId,
        mapping: action.payload.mapping,
      });
    },
  },
});

export const { addMessage, storePiiMapping } = messagesSlice.actions;
export default messagesSlice.reducer;
