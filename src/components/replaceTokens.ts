import type {
  NerTokenType,
  PiiGroupType,
  PiiSpanType,
  TokenType,
} from "../types";

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
    // we need to keep a count of the number of occurrences of each type
    const count = groups.filter((group) => group.type === type).length + 1;
    const placeholder = `[${type}_${count}]`; // Number per type (PERSON_1,EMAIL_1, PERSON_2, …).

    const last = groups[groups.length - 1];
    const startsGroup =
      token.entity.startsWith("B-") || !last || last.type !== type;

    if (startsGroup) {
      groups.push({
        type,
        words: [token.word],
        indexes: [token.index],
        placeholder,
      });
    } else {
      last.words.push(token.word);
      last.indexes.push(token.index);
    }
  }

  return groups;
}

function locateEntities(
  content: string,
  groups: PiiGroupType[],
): PiiSpanType[] {
  const spans: PiiSpanType[] = [];
  let cursor = 0;

  for (const group of groups) {
    const groupFrom = cursor;
    let start = -1;
    let end = cursor;

    for (const raw of group.words) {
      const needle = raw.replace(/^##/, "").toLowerCase();
      if (!needle) {
        continue;
      }

      const at = content.slice(cursor).toLowerCase().indexOf(needle);
      if (at < 0) {
        start = -1;
        break;
      }

      const tokenStart = cursor + at;
      const tokenEnd = tokenStart + needle.length;
      if (start < 0) {
        start = tokenStart;
      }
      end = tokenEnd;
      cursor = tokenEnd;
    }

    if (start < 0) {
      cursor = groupFrom;
      continue;
    }

    spans.push({
      type: group.type,
      start,
      end,
      value: content.slice(start, end),
      placeholder: group.placeholder,
    });
  }

  return spans;
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
  const spans = locateEntities(content, groups);
  console.log("groups", groups);
  console.log("spans", spans);
  return result;
}
