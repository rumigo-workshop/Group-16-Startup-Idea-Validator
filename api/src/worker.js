import {
  JOB_STATUS,
  PROCESSING_MS,
  QUEUED_VISIBLE_MS,
  canTransition,
  shouldFail,
} from "@group16/shared";
import { buildReport } from "./report.js";
import { jobs } from "./store.js";

const queue = [];
let busy = false;

function move(job, to) {
  if (!canTransition(job.status, to)) {
    throw new Error(`Cannot move ${job.status} to ${to}`);
  }
  job.status = to;
  job.updatedAt = new Date().toISOString();
}

function finish(job) {
  try {
    if (job.status !== JOB_STATUS.PROCESSING) return;

    if (shouldFail(job.idea)) {
      move(job, JOB_STATUS.FAILURE);
      job.error = "Validation could not finish for this idea.";
      job.report = null;
      return;
    }

    job.report = buildReport(job.idea);
    job.error = null;
    move(job, JOB_STATUS.SUCCESS);
  } catch {
    if (canTransition(job.status, JOB_STATUS.FAILURE)) {
      job.status = JOB_STATUS.FAILURE;
      job.error = "Validation could not finish for this idea.";
      job.report = null;
      job.updatedAt = new Date().toISOString();
    }
  }
}

function pump() {
  if (busy) return;

  const id = queue.shift();
  if (!id) return;

  const job = jobs.get(id);
  if (!job || job.status !== JOB_STATUS.QUEUED) {
    pump();
    return;
  }

  busy = true;

  setTimeout(() => {
    try {
      move(job, JOB_STATUS.PROCESSING);
    } catch {
      busy = false;
      pump();
      return;
    }

    setTimeout(() => {
      finish(job);
      busy = false;
      pump();
    }, PROCESSING_MS);
  }, QUEUED_VISIBLE_MS);
}

export function enqueue(job) {
  queue.push(job.id);
  pump();
}
