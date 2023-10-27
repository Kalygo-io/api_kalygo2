import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const OpenAI = new OpenAIApi(configuration);

export const generateAccountOpenAI = (accountOpenAiApiKey: string) => {
  return new OpenAIApi(
    new Configuration({
      apiKey: accountOpenAiApiKey,
    })
  );
};
