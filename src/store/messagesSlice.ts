import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    storePiiMapping: (state, action: PayloadAction<PiiMappingType[]>) => {
      // update the piiOccurrencesCount for all the types in the action.payload
      action.payload.forEach((mapping) => {
        const cleanType = mapping.placeholder.replace(/[[\]_\d]/g, "");
        const index = state.piiOccurrencesCount.findIndex(
          (count) => count.type === cleanType,
        );
        if (index !== -1) {
          state.piiOccurrencesCount[index].count++;
        } else {
          state.piiOccurrencesCount.push({ type: cleanType, count: 1 });
        }
      });

      // add the action.payload to the piiMappingList
      state.piiMappingList.push(...action.payload);
    },
  },
});

export const { addMessage, storePiiMapping } = messagesSlice.actions;
export default messagesSlice.reducer;
