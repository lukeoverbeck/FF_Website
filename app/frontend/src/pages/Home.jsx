import SettingsCard from "../components/SettingsCard";
import WinnerCard from "../components/WinnerCard";
import footballImage from "../assets/football.jpg";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import Navbar from "../components/Navbar";

const settingsConfig = {
  num_teams: { label: "Number of Teams", formatter: (val) => val },
  is_keeper: {
    label: "Roster Type",
    formatter: (val) => (val ? "Keeper" : "Redraft"),
  },
  is_FAAB: {
    label: "Waiver System",
    formatter: (val) => (val ? "FAAB ($100)" : "Rolling Waivers"),
  },
  scoring_type: { label: "Scoring System", formatter: (val) => val },
};

const SkeletonCard = ({ className }) => (
  <div className={cn("animate-pulse bg-gray-300 gap-3 h-24", className)}></div>
);

const Home = () => {
  const [settingsCards, setSettingsCards] = useState([]);
  const [winnersCards, setWinnersCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home_dashboard/2025")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        const filteredSettingsKeys = Object.keys(data.settings).filter(
          (key) => key !== "season"
        );

        // data.settings is your original object
        const formattedSettingsArray = filteredSettingsKeys.map((key) => {
          const config = settingsConfig[key];
          return {
            id: key,
            settingsName: config?.label || key, // Use label, fallback to key
            settingsContent:
              config?.formatter(data.settings[key]) || data.settings[key],
          };
        });

        const formattedWinnersArray = data.league_winners.map((winner) => {
          return {
            id: winner.season,
            displayName: winner.display_name,
            teamName: winner.team_name,
            year: winner.season,
            wins: winner.wins,
            losses: winner.losses,
          };
        });

        setSettingsCards(formattedSettingsArray);
        setWinnersCards(formattedWinnersArray);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-100">
        {/* This div keeps everything centered and bounded */}
        <div className="container mx-auto p-6 space-y-8">
          {/* Intro section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch bg-white p-6 rounded-xl shadow">
            {/* Left Column: Text */}
            <div className="flex flex-col border p-6 rounded-lg gap-2">
              <h1 className="text-3xl font-bold">
                Welcome to the Game of Inches Fantasy Home Page!
              </h1>
              <p className="text-slate-600 leading-relaxed">
                This is the site for everything about the Game of Inches fantasy
                football league.
              </p>
            </div>

            {/* Right Column: Image */}
            <figure className="overflow-hidden rounded-xl shadow-lg h-64 md:h-full">
              <img
                src={footballImage}
                alt="Fantasy Football League"
                className="w-full h-full object-cover"
              />
            </figure>
          </div>

          {/* Eventually pull from BigQuery */}
          <div className="grid grid-cols-12 gap-6">
            {isLoading ? (
              <>
                <SkeletonCard className="col-span-12 md:col-span-3" />
                <SkeletonCard className="col-span-12 md:col-span-3" />
                <SkeletonCard className="col-span-12 md:col-span-3" />
                <SkeletonCard className="col-span-12 md:col-span-3" />
              </>
            ) : (
              settingsCards.map((card) => (
                <SettingsCard
                  key={card.id}
                  className="col-span-12 md:col-span-3"
                  {...card}
                />
              ))
            )}
          </div>
          <div className="flex flex-col gap-5 max-w-md mx-auto">
            {isLoading ? (
              <>
                <SkeletonCard className="" />
                <SkeletonCard className="" />
                <SkeletonCard className="" />
                <SkeletonCard className="" />
              </>
            ) : (
              winnersCards.map((card) => (
                <WinnerCard
                  key={card.id} // Use the season/year as the unique key
                  className=""
                  {...card}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
