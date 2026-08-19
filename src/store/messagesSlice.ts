import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ChatMessage = {
  id: number;
  content: string;
  sender: string;
};

type MessagesState = {
  messageList: ChatMessage[];
};

const initialState: MessagesState = {
  messageList: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ content: string; sender: string }>,
    ) => {
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
