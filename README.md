# Group 16: Startup Idea Validator

A founder describes an idea and gets a validation report with competitors, market size, complaints, trends, risks and a score.

This demo keeps books and report jobs in memory. Restarting the API clears them. Nothing is written to a database.

## Run

```bash
pnpm install
pnpm run dev
```

`pnpm run dev` starts the API and the web app together. A report stays in `processing` for about 20 seconds, and the page shows a loading animation until it finishes.

The API listens on port 4000. The web app listens on port 5173 and proxies `/book`, `/report`, and `/health` to the API.

## Routes

Sync book CRUD, answered inside the request:

- `POST /book`
- `GET /book`
- `GET /book/:id`
- `PUT /book/:id`
- `DELETE /book/:id`

Async report job. Create returns immediately. A single worker then moves the job through `queued`, `processing`, and `success` or `failure`.

- `POST /report/create` returns `202` and `{ id, status: "queued" }`
- `GET /report/status/:id`
- `GET /report/view/:id` returns the report only after `success`

An idea that contains the word `fail` finishes as `failure` after the same delays. The same idea text always produces the same score.

`GET /health` returns `{ "status": "ok" }`.
