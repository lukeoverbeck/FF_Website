import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import User from "./pages/User";

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar is outside Routes so it never disappears */}
      <Navbar />

      <main>
        <Routes>
          {/* path="/" to Home page */}
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          {/* <Route path="/standings" element={<Standings />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
