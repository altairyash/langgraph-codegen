import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 3003;


const evalAndCapture = async (code) => {
  try {
    const wrappedCode = `(async () => { return ${code}; })()`; // Ensure it explicitly returns
    const result = await eval(wrappedCode);
    
    console.log("Code executed, result:", result);
    return {
      success: true,
      result, // Capture and return the result
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
