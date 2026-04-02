import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Login from "./pages/Login";
import Commissioner from "./pages/Commissioner";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
  return (
    <div className="min-h-screen bg-background">
      <main>
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
                <User />
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
