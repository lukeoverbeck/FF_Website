import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../lib/utils";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await authFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/home");
    } else {
      setError(data.detail);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

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
          onClick={handleSubmit}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg mt-2"
        >
          Sign In
        </button>
      </div>
    </main>
  );
};

export default LoginPage;
