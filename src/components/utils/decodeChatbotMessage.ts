export function decodeChatbotMessage({
  content,
  userMessageId,
  piiMappingList,
}: {
  content: string;
  userMessageId: string;
  piiMappingList: any[];
}) {
  const piiMapping = piiMappingList.find(
    (mapping: any) => mapping.userMessageId === userMessageId,
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
