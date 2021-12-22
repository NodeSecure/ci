export function formatMilliseconds(ms: number): string {
  const seconds = ms / 1000;
  if (seconds < 1) {
    return `${ms.toFixed(2)}ms`;
  }

  return `${seconds.toFixed(2)}s`;
}

export function pluralize(word: string, wordLength = 2) {
  if (wordLength <= 1) {
    return word;
  }

  const endStr = word.charAt(word.length - 1);
  if (endStr === "y") {
    return `${word.slice(0, word.length - 1)}ies`;
  }

  return `${word}s`;
}
