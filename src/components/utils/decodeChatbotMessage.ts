export function decodeChatbotMessage({
  content,
  userMessageId: messageId,
  piiMappingList,
}: {
  content: string;
  userMessageId: string;
  piiMappingList: any[];
}) {
  const piiMapping = piiMappingList.find(
    (mapping: any) => mapping.messageId === messageId,
  );
  if (!piiMapping) {
    throw new Error("User message ID not found");
  }

  const decodedContent = content.replaceAll(
    /\[([^\]]+)\]/g,
    (match: string) => {
      return piiMapping.mapping[match];
    },
  );
  return decodedContent;
}
