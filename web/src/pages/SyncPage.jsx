import { useEffect, useState } from "react";
import { createBook, deleteBook, listBooks, updateBook } from "../api.js";

const emptyForm = { title: "", author: "", year: "" };

export default function SyncPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function reload() {
    setBooks(await listBooks());
  }

  useEffect(() => {
    let stopped = false;
    listBooks()
      .then((next) => {
        if (!stopped) setBooks(next);
      })
      .catch((err) => {
        if (!stopped) setError(err.message);
      })
      .finally(() => {
        if (!stopped) setLoading(false);
      });
    return () => {
      stopped = true;
    };
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    const body = { title: form.title, author: form.author, year: form.year };
    try {
      if (editingId) await updateBook(editingId, body);
      else await createBook(body);
      setForm(emptyForm);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      year: String(book.year),
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function onDelete(id) {
    setError("");
    try {
      await deleteBook(id);
      if (editingId === id) cancelEdit();
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Sync API</h2>
      <p className="lede">
        Book create, read, update, and delete finish inside the request. The list
        below is the in-memory store.
      </p>

      <form className="panel" onSubmit={onSubmit}>
        <div className="fields">
          <label>
            Title
            <input name="title" value={form.title} onChange={onChange} />
          </label>
          <label>
            Author
            <input name="author" value={form.author} onChange={onChange} />
          </label>
          <label>
            Year
            <input name="year" value={form.year} onChange={onChange} inputMode="numeric" />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button type="submit">{editingId ? "Save book" : "Add book"}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <p>Loading books…</p> : null}

      {!loading && books.length === 0 ? <p>No books yet.</p> : null}

      {books.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Year</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td className="row-actions">
                  <button type="button" className="ghost" onClick={() => startEdit(book)}>
                    Edit
                  </button>
                  <button type="button" className="ghost" onClick={() => onDelete(book.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
