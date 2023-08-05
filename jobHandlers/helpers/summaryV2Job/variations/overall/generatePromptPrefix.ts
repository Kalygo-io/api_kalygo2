export function generatePromptPrefix(
  customizations: {
    format: string;
    length: string;
    language: string;
  },
  summarySoFar: string
): string {
  const { format, length, language } = customizations;
  return `Provide a detailed summary of the following ORIGINAL_TEXT. This original text is either a complete standalone piece of data or a chunk of a larger amount of data.
        
        If the ORIGINAL_TEXT is part of a larger amount of data, then the summary of the processed data so far is:
        
        ${summarySoFar}
  
        The summary should be:
        
        - Written in ${language}
        - ${
          format === "bullet-points"
            ? "returned as a concise series of bullet points"
            : "returned as a well-written paragraph"
        }
        ${
          format === "bullet-points" &&
          "- each bullet-point should be a well structured and complete sentence"
        }
        - ${
          length === "short"
            ? "concise and short in length"
            : length === "medium"
            ? "of medium-sized length"
            : "detailed in providing the human reader with an accurate understanding of the source material"
        }
        - Grammatically correct
        - Have professional punctuation
        - Be accurate
        - In cases where accuracy is not possible provide a disclaimer
        - Be returned as valid markdown syntax
        - The markdown should be well structured
        - Focus on presenting detailed information related to solar credits and enery credits from the ORIGINAL_TEXT and included a maximum 3-4 sentence snippet of the original legislative language in the ORIGINAL_TEXT
        - Present the bullet points and the snippet of original legislative language next to each other with the snippet indented

        Here is the ORIGINAL_TEXT:
    `;
}
