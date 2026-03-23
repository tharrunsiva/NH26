"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { assignTicket, fetchTickets, login, resolveTicket } from "../services/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export default function DashboardClient() {
  const [credentials, setCredentials] = useState({
    email: "agent@example.com",
    password: "password123"
  });
  const [auth, setAuth] = useState(null);
  const [filters, setFilters] = useState({
    severity: "",
    category: "",
    status: ""
  });
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const activeSelected = useMemo(
    () => tickets.find((ticket) => ticket._id === selected?._id) || selected,
    [tickets, selected]
  );

  useEffect(() => {
    if (!auth?.token) return;

    loadTickets(auth.token, filters);

    const socket = io(SOCKET_URL);
    socket.on("ticket:created", () => loadTickets(auth.token, filters));
    socket.on("ticket:updated", () => loadTickets(auth.token, filters));

    return () => socket.disconnect();
  }, [auth, filters]);

  async function loadTickets(token, currentFilters) {
    try {
      const data = await fetchTickets(token, currentFilters);
      setTickets(data);
      if (data.length && !selected) {
        setSelected(data[0]);
      }
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    try {
      const result = await login(credentials);
      setAuth(result);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  async function handleAssign(ticketId) {
    if (!auth?.token || !auth?.user?.id) return;
    await assignTicket(auth.token, ticketId, auth.user.id);
    loadTickets(auth.token, filters);
  }

  async function handleResolve(ticketId) {
    if (!auth?.token) return;
    await resolveTicket(auth.token, ticketId);
    loadTickets(auth.token, filters);
  }

  if (!auth) {
    return (
      <div className="mx-auto max-w-md rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lagoon">
          Agent Access
        </p>
        <h1
          className="mt-3 text-3xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ticket command center
        </h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Email"
            value={credentials.email}
            onChange={(event) => setCredentials((state) => ({ ...state, email: event.target.value }))}
          />
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Password"
            value={credentials.password}
            onChange={(event) => setCredentials((state) => ({ ...state, password: event.target.value }))}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Register an agent account via <code>/api/auth/register</code> first if needed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="glass-panel rounded-[30px] p-5">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon">
            Live Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Tickets</h2>
        </div>

        <div className="grid gap-3">
          <select
            value={filters.severity}
            onChange={(event) => setFilters((state) => ({ ...state, severity: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
          >
            <option value="">All severities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <select
            value={filters.category}
            onChange={(event) => setFilters((state) => ({ ...state, category: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
          >
            <option value="">All categories</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="Delivery">Delivery</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((state) => ({ ...state, status: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => setSelected(ticket)}
              className={`w-full rounded-2xl px-4 py-4 text-left transition ${
                activeSelected?._id === ticket._id ? "bg-ink text-white" : "bg-white/80 text-ink"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">{ticket.ticketId}</p>
              <p className="mt-2 font-semibold">{ticket.issueSummary}</p>
              <p className="mt-2 text-xs">
                {ticket.category} • {ticket.severity} • {ticket.status}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section className="glass-panel rounded-[30px] p-6">
        {activeSelected ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon">
                  {activeSelected.ticketId}
                </p>
                <h2
                  className="mt-2 text-3xl font-semibold text-ink"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {activeSelected.issueSummary}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {activeSelected.category} • {activeSelected.severity} • {activeSelected.status}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAssign(activeSelected._id)}
                  className="rounded-full bg-lagoon px-4 py-3 text-sm font-semibold text-white"
                >
                  Assign to Me
                </button>
                <button
                  onClick={() => handleResolve(activeSelected._id)}
                  className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-3">
                {activeSelected.messages.map((message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`rounded-[24px] px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-lagoon text-white"
                        : message.sender === "bot"
                          ? "bg-white"
                          : "bg-amber-100"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] opacity-60">{message.sender}</p>
                    <p className="mt-2 whitespace-pre-line text-sm">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] bg-white/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Ticket Metadata
                </p>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  <p>
                    <strong>User:</strong> {activeSelected.userId?.name || "Guest"}
                  </p>
                  <p>
                    <strong>Email:</strong> {activeSelected.userId?.email || "Not captured"}
                  </p>
                  <p>
                    <strong>Assigned:</strong> {activeSelected.assignedAgent?.name || "Unassigned"}
                  </p>
                  <p>
                    <strong>Language:</strong> {activeSelected.language}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(activeSelected.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[28px] bg-white/70 p-8 text-slate-500">
            No tickets yet. Create one from the chatbot flow.
          </div>
        )}
      </section>
    </div>
  );
}
