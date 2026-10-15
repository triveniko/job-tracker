import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { STATUSES } from "../constants";
import StatsBar from "../components/StatsBar";
import ApplicationForm from "../components/ApplicationForm";
import StatusBadge from "../components/StatusBadge";

const isSafeLink = (url) => /^https?:\/\//i.test(url || "");

export default function Applications() {
  const { user, logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // application being edited, or null for a new one
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  // Reload the list when filters change (search is debounced by 300ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (status) params.status = status;
        if (search.trim()) params.search = search.trim();
        const res = await api.get("/applications", { params });
        setApps(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [status, search, refreshKey]);

  // Reload the dashboard counts after any change
  useEffect(() => {
    api
      .get("/applications/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [refreshKey]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (app) => {
    setEditing(app);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async (payload) => {
    if (editing) await api.put(`/applications/${editing._id}`, payload);
    else await api.post("/applications", payload);
    closeForm();
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container">
      <header className="topbar">
        <h1>Job Tracker</h1>
        <div>
          <span>{user.name}</span>
          <button className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <StatsBar stats={stats} />

      <div className="toolbar">
        <input
          placeholder="Search company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button onClick={openNew}>+ Add</button>
      </div>

      {formOpen && (
        <ApplicationForm
          key={editing?._id || "new"}
          initial={editing}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && apps.length === 0 && <p>No applications found.</p>}

      <ul className="list">
        {apps.map((app) => (
          <li key={app._id} className="card">
            <div className="row between">
              <div>
                <strong>{app.company}</strong>{" "}
                <span className="muted">{app.role}</span>
              </div>
              <StatusBadge status={app.status} />
            </div>
            {app.appliedDate && (
              <p className="muted">
                Applied: {new Date(app.appliedDate).toLocaleDateString()}
              </p>
            )}
            {app.notes && <p>{app.notes}</p>}
            {isSafeLink(app.link) && (
              <a href={app.link} target="_blank" rel="noreferrer">
                Job link
              </a>
            )}
            <div className="row">
              <button className="secondary" onClick={() => openEdit(app)}>
                Edit
              </button>
              <button className="danger" onClick={() => handleDelete(app._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
