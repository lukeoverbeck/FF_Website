import { useState, useEffect } from "react";
import { authFetch, logToBackend } from "../lib/utils";

const Commissioner = () => {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all managers
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Hardcoded year because it is the most recent data
    authFetch("/api/managers/2025", {
      method: "GET",
    })
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

  // When a display name is selected, populate team name and record from the list
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

  const handleSave = async () => {
    if (!selectedManager) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await authFetch("/api/manager_highlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: Authorization header is removed; authFetch handles it!
        },
        body: JSON.stringify({
          display_name: selectedManager.display_name,
          team_name: selectedManager.team_name,
          wins: selectedManager.total_wins,
          losses: selectedManager.total_losses,
          message: message,
        }),
      });

      if (res && res.ok) {
        setSaveStatus({
          type: "success",
          message: "Manager highlight updated successfully.",
        });
      } else {
        const err = await res.json(); // ← read the actual error from FastAPI
        setSaveStatus({
          type: "error",
          message: err.detail || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      logToBackend(
        "error",
        `Failed to update manager highlight for display_name=${selectedManager?.display_name} — ${err.message}`
      );
      setSaveStatus({
        type: "error",
        message: "Unable to reach the server. Please check your connection.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-6 w-full max-w-lg">
          {/* Header */}
          <div className="flex flex-col gap-1 border-b pb-5">
            <h1 className="text-2xl font-bold text-slate-900">
              Manager Highlight
            </h1>
            <p className="text-sm text-slate-500">
              Set the featured manager displayed on the home page.
            </p>
          </div>

          {/* Display Name Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Display Name
            </label>
            <select
              onChange={handleManagerSelect}
              defaultValue=""
              disabled={isLoading}
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400"
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

          {/* Team Name — read-only, auto-populated */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Team Name
            </label>
            <input
              type="text"
              readOnly
              value={selectedManager?.team_name || ""}
              placeholder="Auto-populated from selection"
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-500 bg-slate-50 cursor-default focus:outline-none"
            />
          </div>

          {/* 2026 Record — read-only, auto-populated */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              2026 Record
            </label>
            <input
              type="text"
              readOnly
              value={
                selectedManager
                  ? selectedManager.total_wins +
                    "-" +
                    selectedManager.total_losses
                  : ""
              }
              placeholder="Auto-populated from selection"
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-500 bg-slate-50 cursor-default focus:outline-none"
            />
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message about this manager's recent accomplishments..."
              rows={4}
              className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Status feedback */}
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedManager || isSaving}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : "Save Highlight"}
          </button>
        </div>
      </main>
    </>
  );
};

export default Commissioner;
