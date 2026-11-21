import { randomUUID } from "node:crypto";

export const books = new Map();
export const jobs = new Map();

function addBook(title, author, year) {
  const id = randomUUID();
  const book = { id, title, author, year };
  books.set(id, book);
  return book;
}

addBook("The Lean Startup", "Eric Ries", 2011);
addBook("Zero to One", "Peter Thiel", 2014);

export function createBook(value) {
  return addBook(value.title, value.author, value.year);
}

export function listBooks() {
  return [...books.values()];
}

export function getBook(id) {
  return books.get(id) ?? null;
}

export function replaceBook(id, value) {
  if (!books.has(id)) return null;
  const book = { id, title: value.title, author: value.author, year: value.year };
  books.set(id, book);
  return book;
}

export function deleteBook(id) {
  return books.delete(id);
}

export function createJob(idea) {
  const now = new Date().toISOString();
  const job = {
    id: randomUUID(),
    idea,
    status: "queued",
    error: null,
    report: null,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id) ?? null;
}
