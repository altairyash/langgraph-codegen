import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

async function evalAndCaptureOutput(code) {
  const oldLog = console.log;
  const oldError = console.error;

  const output = [];
  let errorOutput = [];

  console.log = (...args) => output.push(args.join(" "));
  console.error = (...args) => errorOutput.push(args.join(" "));

  try {
    await eval(code);
    console.log(await eval(code));
  } catch (error) {
    errorOutput.push(error.message);
  }

  console.log = oldLog;
  console.error = oldError;

  return { stdout: output.join("\n"), stderr: errorOutput.join("\n") };
}
const jsExecutor = tool(
  async ({ code }) => {
    console.log('Running js code:', code);
    const result = await eval(code);
    return result;
  },
  {
    name: 'run_javascript_code_tool',
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
      you have following API keys at disposal:
      WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY
    `,
    schema: z.object({
      code: z.string().describe('code to be executed'),
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
