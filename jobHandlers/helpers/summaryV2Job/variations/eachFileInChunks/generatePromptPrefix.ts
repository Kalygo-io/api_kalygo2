export function generatePromptPrefix(customizations: {
  format: string;
  length: string;
  language: string;
}): string {
  const { format, length, language } = customizations;

  return `Please provide a detailed summary of the following ORIGINAL_TEXT. This original text is either a complete standalone piece of data or is a chunk of a larger amount of data.
                    
        The summary should be:
        
        - Written in ${language}
        - ${
          format === "bullet-points"
            ? "returned as a concise series of bullet points"
            : "returned as a well-written paragraph"
        }
        - ${
          length === "short"
            ? "concise and short in length"
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
  `;
}
