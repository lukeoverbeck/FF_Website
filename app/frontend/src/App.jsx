import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Commissioner from "./pages/Commissioner";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

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
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-background">
      <main>
        {token && <Navbar currentYear={year} onYearChange={setYear} />}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
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
                <User year={year} />
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
