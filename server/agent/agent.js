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
    const result = await response.json();
    console.log(result);
    return result;
  },
  {
    name: "run_javascript_code_tool",
    description: `
      Run general-purpose JavaScript code in a Node.js environment. 
      This tool allows executing JavaScript code to fetch data from the internet or perform calculations.
      
      **Guidelines for Writing JavaScript Code:**
      - **Always wrap the code inside an async function and immediately invoke it.** Example:
        \`\`\`js
        (async () => {
          const response = await fetch("API_URL_HERE");
          const data = await response.json();
          return data;
        })();
        \`\`\`

      >>>> respond is same format as the user message
      - **Only use built-in Node.js functions. No imports are allowed.**
      - **For API calls:**
        - Use \`fetch()\` to call APIs
        - To get weather data, always use api.weatherapi.com
        - To get cryptocurrency prices, always use **coingecko.com**.
        - Use the available API keys from environment variables, always use backticks so that variables are resolved, first store apikey in variables and then use it:
          - WeatherAPI: "\${process.env.WEATHER_API_KEY}"
      - **Return the full API response instead of extracting specific values.**
      - **Ensure all functions are executed inside the provided code snippet.**
      - **Errors should be handled using try/catch and returned in a structured format.**
      -
      >>>>>always console log the fetch urls also
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
  prompt: "is any tool has been run, give response in the same format as the user message"
});
 