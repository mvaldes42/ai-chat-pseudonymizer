import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { parsePlaceholder } from "../components/utils/parsePlaceholder";
import type { MessageType, MessagesState, PiiMappingType } from "../types";

const initialState: MessagesState = {
  messageList: [],
  piiMappingList: [],
  piiOccurrencesCount: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<MessageType>) => {
      state.messageList.push({
        id: state.messageList.length + 1,
        content: action.payload.content,
        sender: action.payload.sender,
      });
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      const lastMessage = state.messageList[state.messageList.length - 1];
      if (lastMessage?.sender === "assistant") {
        lastMessage.content = action.payload;
        return;
      }
      state.messageList.push({
        id: state.messageList.length + 1,
        content: action.payload,
        sender: "assistant",
      });
    },
    storePiiMapping: (state, action: PayloadAction<PiiMappingType[]>) => {
      action.payload.forEach((mapping) => {
        const parsed = parsePlaceholder(mapping.placeholder);
        if (!parsed) {
          return;
        }
        const index = state.piiOccurrencesCount.findIndex(
          (count) => count.type === parsed.type,
        );
        if (index !== -1) {
          state.piiOccurrencesCount[index].count++;
        } else {
          state.piiOccurrencesCount.push({ type: parsed.type, count: 1 });
        }
      });

      state.piiMappingList.push(...action.payload);
    },
  },
});

export const { addMessage, addAssistantMessage, storePiiMapping } =
  messagesSlice.actions;
export default messagesSlice.reducer;
