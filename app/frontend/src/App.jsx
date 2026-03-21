import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar is outside Routes so it never disappears */}
      <Navbar />

      <main>
        <Routes>
          {/* path="/" to Home page */}
          <Route path="/" element={<Home />} />

          {/* path="/user_dashboard" -- future path to user dashboard page */}
          {/* <Route path="/standings" element={<Standings />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
