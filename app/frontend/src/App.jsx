import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "./components/Navbar";
import SettingsCard from "./components/SettingsCard";
import WinnerCard from "./components/WinnerCard";

// 1. Define your Page components
const Home = () => (
  <main className="min-h-screen bg-slate-100">
    {/* This div keeps everything centered and bounded */}
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-blue-600 text-white p-10 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold">League Dashboard</h1>
        <p className="mt-2 opacity-90">Welcome back, Commissioner Luke.</p>
      </div>

      {/* Eventually pull from BigQuery */}
      <div className="grid grid-cols-12 gap-6">
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Number of Teams"
          settingsContent="12"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Roster Type"
          settingsContent="Keeper"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Scoring System"
          settingsContent="Half-PPR"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Waiver System"
          settingsContent="FAAB ($100)"
        />
      </div>
      <div className="flex flex-col gap-5 max-w-md mx-auto">
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
      </div>
    </div>
  </main>
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
