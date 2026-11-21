import { Router } from "express";
import { JOB_STATUS, validateIdea } from "@group16/shared";
import { createJob, getJob } from "../store.js";
import { enqueue } from "../worker.js";

export const reportsRouter = Router();

function statusBody(job) {
  const body = { id: job.id, status: job.status };
  if (job.status === JOB_STATUS.FAILURE) body.error = job.error;
  return body;
}

reportsRouter.post("/create", (req, res) => {
  const parsed = validateIdea(req.body?.idea);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const job = createJob(parsed.value);
  enqueue(job);
  res.status(202).json({ id: job.id, status: job.status });
});

reportsRouter.get("/status/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Report not found." });
    return;
  }
  res.json(statusBody(job));
});

reportsRouter.get("/view/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Report not found." });
    return;
  }

  if (job.status !== JOB_STATUS.SUCCESS) {
    res.status(409).json({
      error:
        job.status === JOB_STATUS.FAILURE
          ? job.error
          : "Report is not ready.",
      status: job.status,
    });
    return;
  }

  res.json(job.report);
});
