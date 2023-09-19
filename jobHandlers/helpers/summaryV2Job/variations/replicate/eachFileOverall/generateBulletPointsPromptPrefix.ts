export function generateBulletPointsPromptPrefix(
  customizations: {
    length: string;
    language: string;
  },
  summarySoFar: string
): string {
  const { length, language } = customizations;
  return `Provide a list of bullet points of the following ORIGINAL_TEXT.
          
          The summary should be:
          
          - Written in ${language}
          - a concise series of bullet points
          - each bullet-point should be a well structured and complete thought
          - ${
            length === "short"
              ? "very concise and very short in length"
              : length === "medium"
              ? "of medium-sized length"
              : "concise but very detailed in it's attempt to provide the human reader with a quick and accurate understanding of the source material"
          }
          - Grammatically correct
          - Have professional punctuation
          - Be accurate
          - In cases where accuracy is not possible provide a disclaimer
          - Be returned as valid markdown syntax
          - The markdown should be well structured
                
          Here is the ORIGINAL_TEXT:

          ${summarySoFar}
      `;
}
