import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    message: "Express OK!"
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
