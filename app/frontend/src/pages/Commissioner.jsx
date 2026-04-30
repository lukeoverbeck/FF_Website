import { useState, useEffect } from "react";
import { authFetch, logToBackend } from "../lib/utils";
import footballImage from "../assets/football.jpg";

// ─────────────────────────────────────────────
// Commissioner
// Admin-only portal for curating the Manager Highlight that appears on the Home page.
// On mount, fetches the full 2025 manager roster from /api/managers/2025 and populates a dropdown.
// Selecting a manager auto-fills their team name and season record; the commissioner then writes
// a custom message before saving the highlight to /api/manager_highlight via POST.
// ─────────────────────────────────────────────
const Commissioner = () => {
  // ── Component state ──
  // managers       – full roster fetched on mount
  // selectedManager – the manager object chosen in the dropdown
  // message        – commissioner-authored spotlight text
  // saveStatus     – success/error feedback after a save attempt
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);

  // ── Data fetch on mount: load all managers for the 2025 (most recent) season ──
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    authFetch("/api/managers/2025", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.detail || "Failed to fetch managers");
          });
        }
        return res.json();
      })
      .then((data) => {
        setManagers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        logToBackend("error", `Failed to fetch managers — ${err.message}`);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // ── Full-page error state: shown when the initial fetch fails ──
  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-slate-700">
            Something went wrong
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  // ── Dropdown change handler ──
  // Looks up the matching manager object by display_name
  // and resets any prior save status feedback.
  const handleManagerSelect = (e) => {
    const displayName = e.target.value;
    if (!displayName) {
      setSelectedManager(null);
      return;
    }
    const match = managers.find((m) => m.display_name === displayName);
    setSelectedManager(match || null);
    setSaveStatus(null);
  };

  // ── Save handler ──
  // POSTs the selected manager's data and custom message
  // to /api/manager_highlight. Clears all fields on success
  // and surfaces a typed saveStatus banner for both outcomes.
  const handleSave = async () => {
    if (!selectedManager) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await authFetch("/api/manager_highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: selectedManager.display_name,
          team_name: selectedManager.team_name,
          wins: selectedManager.total_wins,
          losses: selectedManager.total_losses,
          message: message,
          profile_picture: selectedManager.profile_picture,
        }),
      });

      if (res && res.ok) {
        setSaveStatus({
          type: "success",
          message: "Manager highlight updated successfully.",
        });
        // Clear fields on success
        setMessage("");
        setSelectedManager(null);
      } else {
        const err = await res.json();
        setSaveStatus({
          type: "error",
          message: err.detail || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      logToBackend("error", `Failed to update highlight — ${err.message}`);
      setSaveStatus({
        type: "error",
        message: "Unable to reach the server. Please check your connection.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──
  // Hero banner mirrors the style used across other pages.
  // The form card contains four fields:
  //   1. Manager dropdown (user-controlled)
  //   2. Team name (read-only, auto-populated)
  //   3. Season record (read-only, auto-populated)
  //   4. Message textarea (user-controlled)
  // Save button is disabled until a manager is selected
  // or while a save request is in-flight.
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      <div className="relative overflow-hidden min-h-64 bg-linear-to-br from-navy via-navy-light to-navy">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
        <img
          src={footballImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-10 mix-blend-luminosity"
        />
        <div className="relative z-10 container mx-auto px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl mb-3">
            Commissioner Portal
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Manage featured highlights.
          </p>
        </div>
      </div>

      <div className="grow flex items-start justify-center p-6 py-12">
        <div className="bg-white rounded-xl shadow-xl border-t-4 border-gold p-10 flex flex-col gap-6 w-full max-w-lg">
          <div className="flex flex-col gap-1 border-b pb-5">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
              League Content
            </p>
            <h1 className="text-2xl font-bold text-navy">Manager Highlight</h1>
            <p className="text-sm text-slate-500">
              Set the featured manager displayed on the home page.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-navy">
              Display Name
            </label>
            <select
              onChange={handleManagerSelect}
              value={selectedManager?.display_name || ""}
              disabled={isLoading || isSaving}
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50 disabled:bg-slate-50"
            >
              <option value="" disabled>
                {isLoading ? "Loading managers..." : "Select a manager..."}
              </option>
              {managers.map((m) => (
                <option key={m.display_name} value={m.display_name}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-navy">Team Name</label>
            <input
              type="text"
              readOnly
              value={selectedManager?.team_name || ""}
              placeholder="Auto-populated from selection"
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-500 bg-slate-50 cursor-default focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-navy">
              2026 Record
            </label>
            <input
              type="text"
              readOnly
              value={
                selectedManager
                  ? `${selectedManager.total_wins}-${selectedManager.total_losses}`
                  : ""
              }
              placeholder="Auto-populated from selection"
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-500 bg-slate-50 cursor-default focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-navy">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSaving}
              placeholder="Write a message about this manager's recent accomplishments..."
              rows={4}
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50"
            />
          </div>

          {saveStatus && (
            <p
              className={`text-sm font-medium ${
                saveStatus.type === "success"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {saveStatus.type === "success" ? "✓ " : "✗ "}
              {saveStatus.message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!selectedManager || isSaving}
            className="w-full py-2.5 bg-navy hover:bg-navy-light disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : "Save Highlight"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Commissioner;
