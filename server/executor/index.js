import express from "express";
import cors from "cors";

const app = express();
const port = 3003;

const evalAndCapture = async (code) => {
  try {
    const result = await eval(code);
    console.log("code executed");
    return {
      success: true,
      result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }
};

app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/", async (req, res) => {
  const { code } = req.body;
  const response = await evalAndCapture(code);
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
