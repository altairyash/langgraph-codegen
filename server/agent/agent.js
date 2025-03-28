import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const jsExecutor = tool(
  async ({ code }) => {
    console.log("Running js code:", code);
    const response = await fetch(process.env.EXECUTOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const { result } = await response.json();
    console.log(result);
    return result;
  },
  {
    name: "run_javascript_code_tool",
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
      you have following API keys at disposal:
      WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY
    `,
    schema: z.object({
      code: z.string().describe("code to be executed"),
    }),
  }
);
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
});
const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [jsExecutor],
  checkpointSaver,
});
