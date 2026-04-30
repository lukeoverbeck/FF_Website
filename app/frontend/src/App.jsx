import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import { authFetch } from "./lib/utils";
import Commissioner from "./pages/Commissioner";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

// ── ProtectedRoute ──
// Wraps any route that requires authentication. Redirects to /login if no token exists or if the
// decoded JWT is expired or malformed. On valid tokens, renders children as-is.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (decoded.exp < currentTime) {
      // Token is expired!
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // Token is malformed
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  return children;
};

// ── CommissionerRoute ──
// Extends ProtectedRoute with a role check. Authenticated
// users whose JWT role is not "commissioner" are redirected to /home rather than seeing a 403 error page.
const CommissionerRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }
    if (decoded.role !== "commissioner") {
      return <Navigate to="/home" />;
    }
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
  return children;
};

// ── CatchAll ──
// Handles any unmatched path. Authenticated users land on /home; unauthenticated users are sent to /login.
const CatchAll = () => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/home" />;
  return <Navigate to="/login" />;
};

// ─────────────────────────────────────────────
// App
// Root component. Owns the three pieces of global state shared across all pages: the selected season
// year, the auth token, and the current user's roster ID for that year. The roster ID is re-fetched from
// /api/roster_mapping/{year} whenever year or token changes, ensuring page components always receive a
// valid rosterId for their data fetches.
// ─────────────────────────────────────────────
function App() {
  const [year, setYear] = useState("2025");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [rosterId, setRosterId] = useState(null);
  const [rosterError, setRosterError] = useState(null);

  useEffect(() => {
    if (token) {
      setRosterError(null);
      // Fetch the specific roster mapping for this user + this year
      authFetch(`/api/roster_mapping/${year}`, {
        method: "GET",
      })
        .then((res) => {
          if (!res || !res.ok) {
            return res.json().then((err) => {
              throw new Error(err.detail || "Failed to fetch roster mapping");
            });
          }
          return res.json();
        })
        .then((data) => {
          setRosterId(data.roster_id);
        })
        .catch((err) => {
          setRosterError(err.message);
        });
    }
  }, [year, token]); // Runs every time the year OR user changes

  return (
    <div className="min-h-screen bg-background">
      <main>
        {token && (
          <Navbar
            currentYear={year}
            onYearChange={setYear}
            setToken={setToken}
            currentRosterId={rosterId}
          />
        )}
        {rosterError && (
          <div className="container mx-auto px-6 py-3">
            <p className="text-sm text-red-500">{rosterError}</p>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home year={year} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home year={year} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <User year={year} currentRosterId={rosterId} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commissioner"
            element={
              <CommissionerRoute>
                <Commissioner />
              </CommissionerRoute>
            }
          />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
