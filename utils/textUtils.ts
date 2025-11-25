
export const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= maxLength) {
      chunks.push(remainingText);
      break;
    }

    let chunk = remainingText.substring(0, maxLength);
    let lastSplitPoint = -1;

    // Prioritize splitting at newlines, then other sentence endings.
    const sentenceEndings = ['\n', '.', '?', '!'];
    for (const ending of sentenceEndings) {
      const index = chunk.lastIndexOf(ending);
      if (index !== -1) {
        lastSplitPoint = index + ending.length;
        break; // Found the highest priority split point
      }
    }

    if (lastSplitPoint === -1) {
      // If no sentence end found, try to split at a word boundary
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace !== -1) {
        lastSplitPoint = lastSpace;
      } else {
        // If no space, it will just cut at maxLength as a fallback
        lastSplitPoint = maxLength;
      }
    }

    chunks.push(remainingText.substring(0, lastSplitPoint));
    remainingText = remainingText.substring(lastSplitPoint).trimStart();
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
};
