import cors from "cors";
import express from "express";
import { booksRouter } from "./routes/books.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/book", booksRouter);
app.use("/report", reportsRouter);

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).json({ error: "Body must be JSON." });
    return;
  }
  res.status(500).json({ error: "Something went wrong." });
});

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
