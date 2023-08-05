export function generatePromptPrefix(
  customizations: {
    format: string;
    length: string;
    language: string;
  },
  summarySoFar: string
): string {
  const { format, length, language } = customizations;
  return `Provide a detailed SUMMARY of the following ORIGINAL_TEXT. This original text is either a complete standalone piece of data or a chunk of a larger amount of data.
        
        If the ORIGINAL_TEXT is part of a larger amount of data, then the SUMMARY_SO_FAR of the processed data of the rest of the larger amount of data is: ${summarySoFar}
  
        The SUMMARY should be:
        
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
        - Highlight all of the solar incentives and include the page number and line number where in ORIGINAL_TEXT the solar incentive came from including a maximum 3-4 sentence snippet of the original legislative language
        - Present the bullet point and the snippet of original legislative language next to each other with the snippet indented
        - Generated in a way that incorporates the SUMMARY_SO_FAR to generate a SUMMARY that synthesizes and communicates clearly an accurate and thorough understanding of the overall data to a human reader

        Here is the ORIGINAL_TEXT:
    `;
}
