import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { ChatOpenAI } from "@langchain/openai"

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    apiKey: process.env.OPENAI_API_KEY,
})
const agent = createReactAgent({
    llm: model,
    tools: []
});

const result = await agent.invoke({
    messages: [{
        role: "user",
        content: "What is the capital of the moon?"
    }],
})

// Fix array access syntax and add error handling
const lastMessage = result.messages[result.messages.length - 1];
console.log(lastMessage?.content || "No response received");
