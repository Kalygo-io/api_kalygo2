export function generateRagPromptPrefix(
  retrievedMatches: {
    question: string;
    answer: string;
  }[],
  prompt: string
): string {
  let context = ``;

  for (let i = 0; i < retrievedMatches.length; i++) {
    context += `Q: ${retrievedMatches[i].question}\nA: ${retrievedMatches[i].answer}\n\n`;
  }

  return context;
}
