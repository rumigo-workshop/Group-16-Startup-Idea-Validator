import { NavLink, Route, Routes } from "react-router-dom";
import AsyncPage from "./pages/AsyncPage.jsx";
import SyncPage from "./pages/SyncPage.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="eyebrow">Group 16</p>
          <h1>Startup Idea Validator</h1>
        </div>
        <nav>
          <NavLink to="/" end>
            Sync API
          </NavLink>
          <NavLink to="/async">Async API</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SyncPage />} />
          <Route path="/async" element={<AsyncPage />} />
        </Routes>
      </main>
    </div>
  );
}
