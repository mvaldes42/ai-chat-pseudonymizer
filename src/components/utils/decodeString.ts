import { PiiMappingType } from "../../types";
import { placeholderInText } from "./parsePlaceholder";

export function decodeString({
  content,
  piiMappingList,
}: {
  content: string;
  piiMappingList: PiiMappingType[];
}) {
  const decodedContent = content.replaceAll(
    placeholderInText(),
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
