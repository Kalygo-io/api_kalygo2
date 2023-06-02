import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

const enc = encoding_for_model("gpt-3.5-turbo");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPartsValid(parts: string[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > 4096) return false;
  }

  return true;
}

const PROMPT_PREFIX = (
  lng: string
) => `Please provide a detailed summary of the following ORIGINAL_TEXT
            
The summary should be:

- Written in ${lng}
- Grammatically correct
- Have professional punctuation
- Be accurate
- In cases where accuracy is not possible please provide a disclaimer
      
Here is the ORIGINAL_TEXT:`;

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

    switch (language) {
      case "en":
        language = "English";
        break;
      case "es":
        language = "Spanish";
        break;
      default:
        language = "English";
    }

    const result = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    if (result?.stripeId) {
      const text = fs.readFileSync(`${req.body.filePath}`, "utf8");
      const tokenCount: number = enc.encode(text).length;
      const apiCost = (tokenCount / 1000) * 0.002;
      const markup = 1.4; // 40%
      const quote: number = Number.parseFloat(
        (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
      );

      await stripe.charges.create({
        amount: quote * 100,
        currency: "usd",
        description: `Summarization for ${req.body.filePath}`,
        customer: result?.stripeId,
      });

      let parts = [text];

      while (!isPartsValid(parts)) {
        let newParts = [];

        for (let i = 0; i < parts.length; i++) {
          const prompt = PROMPT_PREFIX(language) + parts[i];

          if (enc.encode(prompt).length > 4000) {
            let middle = Math.floor(prompt.length / 2);
            let before = prompt.lastIndexOf(" ", middle);
            let after = prompt.indexOf(" ", middle + 1);

            if (middle - before < after - middle) {
              middle = before;
            } else middle = after;

            const s1 = prompt.substring(0, middle);
            const s2 = prompt.substring(middle + 1);

            newParts.push(s1, s2);
          } else newParts.push(parts[i]);
        }

        parts = newParts;
      }

      let finalAnswer = [];
      let tokenAccum: number = 0;
      console.log("parts.length", parts.length);

      for (let i = 0; i < parts.length; i++) {
        const prompt = `${PROMPT_PREFIX(language)} ${parts[i]}`;

        tokenAccum += enc.encode(prompt).length;

        console.log("part", i);
        console.log("token length of part", enc.encode(prompt).length);
        console.log("tokenAccum", tokenAccum);

        if (tokenAccum > 4000) {
          await sleep(60000);
          tokenAccum = 0;
        }

        await sleep(0);

        const completion = await OpenAI.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
        });

        finalAnswer.push(completion.data?.choices[0]?.message?.content);
      }

      fs.unlinkSync(`${req.body?.filePath}`);

      res.status(200).json({
        summary: finalAnswer,
        originalLength: text.length,
        condensedLength: finalAnswer.reduce(
          (acc, element) => acc + element!.length,
          0
        ),
      });
    } else {
      res.status(400).send();
    }
  } catch (e) {
    next(e);
  }
}
