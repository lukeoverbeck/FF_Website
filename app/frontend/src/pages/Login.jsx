import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logToBackend } from "../lib/utils";

const LoginPage = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        navigate("/home");
      } else if (res.status === 503) {
        setError("Service temporarily unavailable. Please try again later.");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      logToBackend(
        "error",
        `Login failed for username=${username} — ${err.message}`
      );
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form className="flex flex-col gap-1">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400 "
          />

          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
