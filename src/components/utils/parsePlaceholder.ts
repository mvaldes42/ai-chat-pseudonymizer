/** One placeholder token: [PERSON_1], [EMAIL_ADDRESS_12], … */
const PLACEHOLDER = String.raw`\[([^\]]+)_(\d+)\]`

export function placeholderInText(): RegExp {
  return new RegExp(PLACEHOLDER, 'g')
}

export function parsePlaceholder(
  placeholder: string,
): { type: string; index: number } | null {
  const match = placeholder.match(new RegExp(`^${PLACEHOLDER}$`))
  if (!match) {
    return null
  }
  return { type: match[1], index: Number(match[2]) }
}
