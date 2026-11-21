import { useEffect, useRef, useState } from "react";
import { JOB_STATUS, PROCESSING_MS } from "@group16/shared";
import { createReport, reportStatus, reportView } from "../api.js";

const TERMINAL = new Set([JOB_STATUS.SUCCESS, JOB_STATUS.FAILURE]);

export default function AsyncPage() {
  const [idea, setIdea] = useState("");
  const [jobs, setJobs] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const jobsRef = useRef(jobs);
  const viewing = useRef(new Set());
  jobsRef.current = jobs;

  useEffect(() => {
    let stopped = false;

    async function tick() {
      const active = jobsRef.current.filter((job) => !TERMINAL.has(job.status));
      if (active.length === 0) return;

      await Promise.all(
        active.map(async (job) => {
          try {
            const next = await reportStatus(job.id);
            if (stopped) return;

            if (next.status === JOB_STATUS.SUCCESS) {
              if (viewing.current.has(job.id)) return;
              viewing.current.add(job.id);
              try {
                const report = await reportView(job.id);
                if (stopped) return;
                setJobs((prev) =>
                  prev.map((item) =>
                    item.id === job.id
                      ? {
                          ...item,
                          status: JOB_STATUS.SUCCESS,
                          error: null,
                          clientError: "",
                          report,
                        }
                      : item,
                  ),
                );
              } catch (error) {
                viewing.current.delete(job.id);
                if (stopped) return;
                setJobs((prev) =>
                  prev.map((item) => {
                    if (item.id !== job.id || TERMINAL.has(item.status)) return item;
                    return { ...item, clientError: error.message };
                  }),
                );
              }
              return;
            }

            setJobs((prev) =>
              prev.map((item) => {
                if (item.id !== job.id || TERMINAL.has(item.status)) return item;
                return {
                  ...item,
                  status: next.status,
                  error: next.error ?? null,
                  clientError: "",
                };
              }),
            );
          } catch (error) {
            if (stopped) return;
            setJobs((prev) =>
              prev.map((item) => {
                if (item.id !== job.id || TERMINAL.has(item.status)) return item;
                return { ...item, clientError: error.message };
              }),
            );
          }
        }),
      );
    }

    const timer = setInterval(tick, 500);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const created = await createReport(idea);
      setJobs((prev) => [
        {
          id: created.id,
          idea: idea.trim(),
          status: created.status,
          error: null,
          report: null,
          clientError: "",
        },
        ...prev,
      ]);
      setIdea("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Async API</h2>
      <p className="lede">
        Create returns a job id at once. This page polls status until the job
        reaches success or failure. Processing takes about 20 seconds, and a
        second idea stays queued while the first is still running. Include the
        word fail to land on failure.
      </p>

      <form className="panel" onSubmit={onSubmit}>
        <label>
          Idea
          <textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            rows={4}
            placeholder="A notebook that turns founder interviews into a one-page validation report"
          />
        </label>
        {formError ? <p className="error">{formError}</p> : null}
        <div className="actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create report"}
          </button>
        </div>
      </form>

      {jobs.length === 0 ? <p>No jobs yet.</p> : null}

      <ul className="jobs">
        {jobs.map((job) => (
          <li key={job.id} className="panel">
            <div className="job-head">
              <p className="idea">{job.idea}</p>
              <JobStatus status={job.status} />
            </div>
            <p className="job-id">{job.id}</p>
            <JobLoading status={job.status} />
            {job.clientError ? <p className="error">{job.clientError}</p> : null}
            {job.status === JOB_STATUS.FAILURE ? <p className="error">{job.error}</p> : null}
            {job.report ? <Report report={job.report} /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function JobStatus({ status }) {
  const busy = status === JOB_STATUS.QUEUED || status === JOB_STATUS.PROCESSING;
  return (
    <span className={`status status-${status}`}>
      {busy ? <span className="spinner" aria-hidden="true" /> : null}
      {status}
    </span>
  );
}

function JobLoading({ status }) {
  if (status !== JOB_STATUS.QUEUED && status !== JOB_STATUS.PROCESSING) return null;

  const processing = status === JOB_STATUS.PROCESSING;
  return (
    <div className="load" aria-live="polite">
      <p>{processing ? "Processing. This takes about 20 seconds." : "Queued. Waiting for the worker."}</p>
      {processing ? (
        <div className="load-track">
          <div className="load-bar" style={{ animationDuration: `${PROCESSING_MS}ms` }} />
        </div>
      ) : null}
    </div>
  );
}

function Report({ report }) {
  return (
    <div className="report">
      <p className="score">
        Score <strong>{report.score}</strong>
      </p>
      <h3>Reasons</h3>
      <ul>
        {report.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <h3>Competitors</h3>
      <ul>
        {report.competitors.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>Market</h3>
      <dl>
        <div>
          <dt>TAM</dt>
          <dd>{report.market.tam}</dd>
        </div>
        <div>
          <dt>SAM</dt>
          <dd>{report.market.sam}</dd>
        </div>
        <div>
          <dt>SOM</dt>
          <dd>{report.market.som}</dd>
        </div>
      </dl>
      <h3>Complaints</h3>
      <ul>
        {report.complaints.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>Trends</h3>
      <ul>
        {report.trends.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>Risks</h3>
      <ul>
        {report.risks.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
