import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessageType, MessagesState } from "../types";

const initialState: MessagesState = {
  messageList: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<ChatMessageType, "id">>) => {
      state.messageList.push({
        id: state.messageList.length + 1,
        content: action.payload.content,
        sender: action.payload.sender,
      });
    },
  },
});

export const { addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
