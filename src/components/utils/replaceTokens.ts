import type {
  NerTokenType,
  PiiGroupType,
  PiiMappingType,
  PiiOccurrenceCountType,
  PiiSpanType,
} from '../../types'
import { parsePlaceholder } from './parsePlaceholder'

function entityType(entity: string): string | null {
  if (entity === 'O') {
    return null
  }
  return entity.replace(/^[BI]-/, '')
}

function groupEntities({
  piiTokens,
}: {
  piiTokens: NerTokenType[]
}): PiiGroupType[] {
  const groups: PiiGroupType[] = []

  for (const token of piiTokens) {
    const type = entityType(token.entity)
    if (!type) {
      continue
    }

    const last = groups[groups.length - 1]
    const startsGroup =
      token.entity.startsWith('B-') || !last || last.type !== type

    if (startsGroup) {
      groups.push({
        type,
        words: [token.word],
        indexes: [token.index],
      })
    } else {
      last.words.push(token.word)
      last.indexes.push(token.index)
    }
  }

  return groups
}

function seedTypeCounts({
  piiMappingList,
  piiOccurrencesCount,
}: {
  piiMappingList: PiiMappingType[]
  piiOccurrencesCount: PiiOccurrenceCountType[]
}): PiiOccurrenceCountType[] {
  const counts = piiOccurrencesCount.map((count) => ({ ...count }))

  for (const mapping of piiMappingList) {
    const parsed = parsePlaceholder(mapping.placeholder)
    if (!parsed) {
      continue
    }
    const existing = counts.find((count) => count.type === parsed.type)
    if (existing) {
      existing.count = Math.max(existing.count, parsed.index)
    } else {
      counts.push({ type: parsed.type, count: parsed.index })
    }
  }

  return counts
}

function attributePlaceholder({
  spans,
  piiMappingList,
  piiOccurrencesCount,
}: {
  spans: PiiSpanType[]
  piiMappingList: PiiMappingType[]
  piiOccurrencesCount: PiiOccurrenceCountType[]
}): PiiSpanType[] {
  const currentTypeCount = seedTypeCounts({
    piiMappingList,
    piiOccurrencesCount,
  })

  for (const span of spans) {
    const existingMapping = piiMappingList.find((mapping) => {
      return mapping.value === span.value
    })
    if (existingMapping) {
      span.placeholder = existingMapping.placeholder
      span.alreadyMapped = true
    } else {
      const currentCount = currentTypeCount.find(
        (pii: any) => pii.type === span.type,
      )

      if (currentCount) {
        currentCount.count++
        span.placeholder = `[${span.type}_${currentCount.count}]`
      } else {
        currentTypeCount.push({ type: span.type, count: 1 })
        span.placeholder = `[${span.type}_${1}]`
      }
      span.alreadyMapped = false
    }
  }

  return spans
}

function locateEntities({
  content,
  groups,
}: {
  content: string
  groups: PiiGroupType[]
}): PiiSpanType[] {
  const spans: PiiSpanType[] = []
  let cursor = 0

  for (const group of groups) {
    const groupFrom = cursor
    let start = -1
    let end = cursor

    for (const raw of group.words) {
      const needle = raw.replace(/^##/, '').toLowerCase()
      if (!needle) {
        continue
      }

      const at = content.slice(cursor).toLowerCase().indexOf(needle)
      if (at < 0) {
        start = -1
        break
      }

      const tokenStart = cursor + at
      const tokenEnd = tokenStart + needle.length
      if (start < 0) {
        start = tokenStart
      }
      end = tokenEnd
      cursor = tokenEnd
    }

    if (start < 0) {
      cursor = groupFrom
      continue
    }

    spans.push({
      type: group.type,
      start,
      end,
      value: content.slice(start, end),
      placeholder: null,
      alreadyMapped: false,
    })
  }

  return spans
}

function replaceEntities({
  content,
  spans,
}: {
  content: string
  spans: PiiSpanType[]
}): string {
  let result = ''
  let last = 0

  for (const span of spans) {
    result += content.slice(last, span.start) + span.placeholder
    last = span.end
  }

  return result + content.slice(last)
}

function createPiiMapping({
  spans,
}: {
  spans: PiiSpanType[]
}): PiiMappingType[] | undefined {
  if (spans.length === 0) {
    return undefined
  }
  const mapping: PiiMappingType[] = []
  for (const span of spans) {
    if (span.placeholder && !span.alreadyMapped) {
      mapping.push({
        placeholder: span.placeholder,
        value: span.value,
      })
    }
  }
  return mapping
}

export function replaceTokens({
  content,
  piiTokens,
  piiOccurrencesCount,
  piiMappingList,
}: {
  content: string
  piiTokens: NerTokenType[]
  piiOccurrencesCount: PiiOccurrenceCountType[]
  piiMappingList: PiiMappingType[]
}) {
  const groups = groupEntities({
    piiTokens,
  })
  const spans = locateEntities({ content, groups })

  const spansWithPlaceholder = attributePlaceholder({
    spans,
    piiMappingList,
    piiOccurrencesCount,
  })
  const result = replaceEntities({ content, spans: spansWithPlaceholder })
  const mapping = createPiiMapping({ spans: spansWithPlaceholder })

  return { result, mapping }
}
