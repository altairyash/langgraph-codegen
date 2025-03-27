import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const weatherTool = tool(
  async (location) => {
    console.log(location);
    // TODO: Implement weather API call

    return "The weather in " + location + " is sunny";
  },
  {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
      location: z.string().describe("The location to get the weather for"),
    }),
  }
);

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
});
const checkpointSaver = new MemorySaver();

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What' the weather in tokyo",
      },
    ],
  },
  {
    configurable: {
      thread_id: "4429",
    },
  }
);

const followUp = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What city is the weather in ?",
      },
    ],
  },
  {
    configurable: {
      thread_id: "4429",
    },
  }
);
// Fix array access syntax and add error handling
const lastMessage = result.messages[result.messages.length - 1];
console.log(lastMessage?.content || "No response received");
console.log(followUp.messages.at(-1)?.content);
