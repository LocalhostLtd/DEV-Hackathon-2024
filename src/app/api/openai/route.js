import { NextResponse } from "next/server";
import { config } from "dotenv";
import OpenAI from "openai";

config();

export async function POST(request) {
  const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
  });

  // grab user input
  const params = await request.json();

  // pass to GPT
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a plant tinder bot. Based on these preferences : ." +
          params.preferences +
          ". Recommend a suitable plant. Only return fields in this order: name, plant type, caring guide, description. Limit caring guide to 30 words. Generate 3.",
      },
    ],
    temperature: 0.1,
    max_tokens: 200,
    top_p: 0.2,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return NextResponse.json(response.choices[0].message.content);
}
