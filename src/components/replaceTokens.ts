import type { NerTokenType, PiiGroupType, TokenType } from "../types";

function entityType(entity: string): string | null {
  if (entity === "O") {
    return null;
  }
  return entity.replace(/^[BI]-/, "");
}

function groupEntities(piiTokens: NerTokenType[]): PiiGroupType[] {
  const groups: PiiGroupType[] = [];

  for (const token of piiTokens) {
    const type = entityType(token.entity);
    if (!type) {
      continue;
    }

    const last = groups[groups.length - 1];
    const startsGroup =
      token.entity.startsWith("B-") || !last || last.type !== type;

    if (startsGroup) {
      groups.push({ type, words: [token.word], indexes: [token.index] });
    } else {
      last.words.push(token.word);
      last.indexes.push(token.index);
    }
  }

  return groups;
}

export function replaceTokens({
  content,
  tokens,
  piiTokens,
}: {
  content: string;
  tokens: TokenType[];
  piiTokens: NerTokenType[];
}) {
  const result = "";
  const groups = groupEntities(piiTokens);
  console.log("groups", groups);
  return result;
}
