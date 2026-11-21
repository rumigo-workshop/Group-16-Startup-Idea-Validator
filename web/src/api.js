async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

export function listBooks() {
  return request("/book");
}

export function createBook(body) {
  return request("/book", { method: "POST", body: JSON.stringify(body) });
}

export function updateBook(id, body) {
  return request(`/book/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteBook(id) {
  return request(`/book/${id}`, { method: "DELETE" });
}

export function createReport(idea) {
  return request("/report/create", {
    method: "POST",
    body: JSON.stringify({ idea }),
  });
}

export function reportStatus(id) {
  return request(`/report/status/${id}`);
}

export function reportView(id) {
  return request(`/report/view/${id}`);
}
