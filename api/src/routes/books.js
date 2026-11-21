import { Router } from "express";
import { validateBook } from "@group16/shared";
import { createBook, deleteBook, getBook, listBooks, replaceBook } from "../store.js";

export const booksRouter = Router();

booksRouter.post("/", (req, res) => {
  const parsed = validateBook(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  res.status(201).json(createBook(parsed.value));
});

booksRouter.get("/", (_req, res) => {
  res.json(listBooks());
});

booksRouter.get("/:id", (req, res) => {
  const book = getBook(req.params.id);
  if (!book) {
    res.status(404).json({ error: "Book not found." });
    return;
  }
  res.json(book);
});

booksRouter.put("/:id", (req, res) => {
  const parsed = validateBook(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const book = replaceBook(req.params.id, parsed.value);
  if (!book) {
    res.status(404).json({ error: "Book not found." });
    return;
  }
  res.json(book);
});

booksRouter.delete("/:id", (req, res) => {
  if (!deleteBook(req.params.id)) {
    res.status(404).json({ error: "Book not found." });
    return;
  }
  res.status(204).end();
});
