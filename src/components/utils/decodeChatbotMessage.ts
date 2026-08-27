import { PiiMappingType } from "../../types";

export function decodeChatbotMessage({
  content,
  piiMappingList,
}: {
  content: string;
  piiMappingList: PiiMappingType[];
}) {
  const decodedContent = content.replaceAll(
    /\[([^\]]+)\]/g,
    (match: string) => {
      return (
        piiMappingList.find((mapping: PiiMappingType) => {
          return mapping.placeholder === match;
        })?.value || match
      );
    },
  );
  return decodedContent;
}
