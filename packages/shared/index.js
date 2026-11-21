export const JOB_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILURE: "failure",
};

export const QUEUED_VISIBLE_MS = 400;
export const PROCESSING_MS = 20000;

const TRANSITIONS = {
  [JOB_STATUS.QUEUED]: [JOB_STATUS.PROCESSING],
  [JOB_STATUS.PROCESSING]: [JOB_STATUS.SUCCESS, JOB_STATUS.FAILURE],
  [JOB_STATUS.SUCCESS]: [],
  [JOB_STATUS.FAILURE]: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function shouldFail(idea) {
  return idea.toLowerCase().includes("fail");
}

export function validateBook(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be an object." };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";

  if (!title) return { ok: false, error: "Title is required." };
  if (!author) return { ok: false, error: "Author is required." };

  if (body.year === "" || body.year === null || body.year === undefined) {
    return { ok: false, error: "Year must be a whole number." };
  }

  const year = typeof body.year === "number" ? body.year : Number(body.year);
  if (!Number.isInteger(year)) {
    return { ok: false, error: "Year must be a whole number." };
  }

  return { ok: true, value: { title, author, year } };
}

export function validateIdea(idea) {
  if (typeof idea !== "string" || idea.trim() === "") {
    return { ok: false, error: "Idea is required." };
  }

  return { ok: true, value: idea.trim() };
}
