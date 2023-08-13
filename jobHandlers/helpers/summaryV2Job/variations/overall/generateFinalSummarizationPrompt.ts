export function generateFinalSummarizationPrompt(
  customizations: {
    format: string;
    length: string;
    language: string;
  },
  eachSummary: string,
  summaryCount: number
): string {
  const { format, length, language } = customizations;

  return `
        Provide a detailed overview FINAL_SUMMARY of the following ${
          summaryCount > 1 ? "SUMMARIES" : "SUMMARY"
        }.
        The ${
          summaryCount > 1 ? "SUMMARIES" : "SUMMARY"
        } will be surrounded by new lines. Provide a FINAL_SUMMARY that meets the following criteria:

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
            ? "very concise and very short in length"
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

        Here ${summaryCount > 1 ? "are the SUMMARIES" : "is the SUMMARY"}:

        ${eachSummary}
      `;
}
