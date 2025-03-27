import express from "express";
import { agent } from "./agent.js";
import cors from "cors";
const app = express();
const port = 3009;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/generate", async (req, res) => {
    const result = await agent.invoke({
        messages: [
            {
                role: "user",
                content: req.body.message
            }
        ]
    }, {
        configurable: {thread_id: req.body.thread_id}
    })
    res.json(result.messages.at(-1).content)
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
