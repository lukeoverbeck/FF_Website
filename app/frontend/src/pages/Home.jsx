import SettingsCard from "../components/SettingsCard";
import WinnerCard from "../components/WinnerCard";
import footballImage from "../assets/football.jpg";
import { useState, useEffect, memo } from "react";
import { authFetch, logToBackend } from "../lib/utils";
import ManagerHighlight from "../components/ManagerHighlight";
import SkeletonCard from "../components/SkeletonCard";

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

const Home = memo(({ year }) => {
  const [settingsCards, setSettingsCards] = useState([]);
  const [winnersCards, setWinnersCards] = useState([]);
  const [highlight, setHighlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    authFetch(`/api/home_dashboard/${year}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(
              err.detail || "Failed to fetch home dashboard data"
            );
          });
        }
        return res.json();
      })
      .then((data) => {
        const filteredSettingsKeys = Object.keys(data.settings).filter(
          (key) => key !== "season"
        );

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
        setHighlight(data.manager_highlight);
        setIsLoading(false);
      })
      .catch((err) => {
        logToBackend(
          "error",
          `Failed to fetch home dashboard for season=${year} — ${err.message}`
        );
        setError(err.message);
        setIsLoading(false);
      });
  }, [year]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="container mx-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-700">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-100">
        {/* This div keeps everything centered and bounded */}
        <div className="container mx-auto p-6 space-y-8">
          {/* Intro section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch bg-white p-6 rounded-xl shadow">
            {/* Left Column: Text */}
            <div className="flex flex-col p-6 rounded-lg gap-2">
              <h1 className="text-3xl font-bold">
                Welcome to the Game of Inches Fantasy Home Page!
              </h1>
              <p className="text-slate-600 leading-relaxed">
                This is the site for everything about the Game of Inches fantasy
                football league.
              </p>
            </div>

            {/* Right Column: Image */}
            <figure className="overflow-hidden rounded-xl h-64 md:h-full">
              <img
                src={footballImage}
                alt="Fantasy Football League"
                className="w-full h-full object-cover"
              />
            </figure>
          </div>

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
                  className="col-span-12 md:col-span-3 shadow"
                  {...card}
                />
              ))
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch rounded-xl">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
              {isLoading ? (
                <>
                  <SkeletonCard className="h-24" />
                  <SkeletonCard className="h-24" />
                  <SkeletonCard className="h-24" />
                  <SkeletonCard className="h-24" />
                </>
              ) : (
                winnersCards.map((card) => (
                  <WinnerCard
                    key={card.id} // Use the season/year as the unique key
                    className="col-span-2 md:col-span-1 shadow"
                    {...card}
                  />
                ))
              )}
            </div>
            <ManagerHighlight highlight={highlight} />
          </div>
        </div>
      </main>
    </>
  );
});

export default Home;
