export function parsePlaceholder(
  placeholder: string,
): { type: string; index: number } | null {
  const match = placeholder.match(/^\[(.+)_(\d+)\]$/);
  if (!match) {
    return null;
  }
  return { type: match[1], index: Number(match[2]) };
}
