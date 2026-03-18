import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Button } from "@/components/ui/button";
import Navbar from "./components/Navbar";

// 1. Define your Page components
const Home = () => (
  <div className="bg-blue-600 text-white p-10 rounded-xl m-6">
    <h1 className="text-4xl font-bold">Tailwind is live</h1>
    <Button className="mt-4" variant="outline">
      Click me
    </Button>
  </div>
);

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
