export function generateFinalSummarizationPrompt(
  customizations: {
    format: string;
    length: string;
    language: string;
  },
  eachSummary: string
): string {
  const { format, length, language } = customizations;

  return `
        Provide a detailed overview summary of the following SUMMARIES with each SUMMARY belonging to a file in a collection of files.
        Each summary will be surrounded by new lines. Provide a summary of the SUMMARIES that meets the following criteria:

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
        - Please synthesize an overview of the summaries overall in relation to each other and extract insights that simplifies digesting what they all mean collectively for the human reader.    

        Here are the SUMMARIES:

        ${eachSummary}
      `;
}
