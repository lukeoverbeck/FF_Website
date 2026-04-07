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

const CatchAll = () => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/home" />;
  return <Navigate to="/login" />;
};

function App() {
  const [year, setYear] = useState("2025");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [rosterId, setRosterId] = useState(null);

  useEffect(() => {
    if (token) {
      // Fetch the specific roster mapping for this user + this year
      authFetch(`/api/roster_mapping/${year}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setRosterId(data.roster_id);
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
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home rosterId={rosterId} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
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
              <ProtectedRoute>
                <Commissioner />
              </ProtectedRoute>
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
