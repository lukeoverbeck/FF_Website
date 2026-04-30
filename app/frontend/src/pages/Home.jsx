import footballImage from "../assets/football.jpg";
import { useState, useEffect, memo } from "react";
import { authFetch, logToBackend } from "../lib/utils";
import ManagerHighlight from "../components/ManagerHighlight";
import SkeletonCard from "../components/SkeletonCard";
import SettingsCard from "../components/SettingsCard";

// ─────────────────────────────────────────────
// settingsConfig
// Static display map for league settings keys
// returned by the API. Each entry defines a
// human-readable label and an optional formatter
// that converts raw API values (booleans, strings)
// into the copy shown in the SettingsCard grid.
// Keys not present here fall back to the raw key
// name and raw value.
// ─────────────────────────────────────────────
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
  scoring_type: {
    label: "Scoring System",
    formatter: (val) => val,
  },
};

// ─────────────────────────────────────────────
// Home
// Primary landing page for authenticated users.
// Fetches /api/home_dashboard/{year} on mount (and whenever year changes) and renders three sections:
//   • League Settings  – four SettingsCards in a grid
//   • League History   – per-season winner list with
//                        current-year gold highlighting
//   • Manager Spotlight – ManagerHighlight card driven
//                        by the commissioner-curated highlight
// Wrapped in memo to skip re-renders when year and currentRosterId props are unchanged.
// ─────────────────────────────────────────────
const Home = memo(({ year }) => {
  // ── Component state ──
  // settingsCards  – formatted array for the SettingsCard grid
  // winnersCards   – formatted array for the league history list
  // highlight      – manager spotlight object from the API
  const [settingsCards, setSettingsCards] = useState([]);
  const [winnersCards, setWinnersCards] = useState([]);
  const [highlight, setHighlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Data fetch: re-runs whenever the selected year changes ──
  // Transforms the raw API response into the three card arrays used by the render sections below.
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
            settingsName: config?.label || key,
            settingsContent:
              config?.formatter(data.settings[key]) || data.settings[key],
          };
        });

        const formattedWinnersArray = data.league_winners.map((winner) => ({
          id: winner.season,
          displayName: winner.display_name,
          teamName: winner.team_name,
          year: winner.season,
          wins: winner.wins,
          losses: winner.losses,
        }));

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

  // ── Full-page error state ──
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
    <main className="min-h-screen bg-slate-100">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden min-h-64 bg-linear-to-br from-navy via-navy-light to-navy">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
        <img
          src={footballImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-10 mix-blend-luminosity"
        />
        <div className="relative z-10 container mx-auto px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl mb-3">
            Game of Inches
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            The official hub for everything regarding the Game of Inches fantasy
            football league.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* ── LEAGUE SETTINGS ──
            Four SettingsCards in a 2×2 / 1×4 responsive grid.
            Replaced by SkeletonCards while data is loading. */}
        <section>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
            League Settings
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
              </>
            ) : (
              settingsCards.map((card) => (
                <SettingsCard key={card.id} {...card} />
              ))
            )}
          </div>
        </section>

        {/* ── LEAGUE HISTORY ──
            Left column: chronological winner list. The card matching
            the currently selected year receives gold border + trophy
            treatment to distinguish the active champion.
            Right column: Manager Spotlight card powered by the
            commissioner-set highlight object. Both columns swap to
            SkeletonCards while loading. */}
        <section>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
            League History
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <>
                  <SkeletonCard className="h-20" />
                  <SkeletonCard className="h-20" />
                  <SkeletonCard className="h-20" />
                  <SkeletonCard className="h-20" />
                </>
              ) : (
                winnersCards.map((card) => {
                  const isCurrentYearWinner = card.year === Number(year);

                  return (
                    <div
                      key={card.id}
                      className={`
                        bg-white rounded-xl shadow-sm flex items-center gap-4 p-4
                        ${
                          isCurrentYearWinner
                            ? "border-l-4 border-gold ring-1 ring-slate-200"
                            : "border border-slate-200"
                        }
                      `}
                    >
                      {/* Year badge */}
                      <div
                        className={`min-w-14 text-center rounded-lg py-1.5 ${
                          isCurrentYearWinner ? "bg-navy" : "bg-slate-100"
                        }`}
                      >
                        <p
                          className={`text-sm font-extrabold ${
                            isCurrentYearWinner ? "text-gold" : "text-slate-500"
                          }`}
                        >
                          {card.year}
                        </p>
                      </div>

                      {/* Name + team */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-navy text-sm">
                          {isCurrentYearWinner && (
                            <span className="text-gold">🏆 </span>
                          )}
                          {card.displayName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide truncate">
                          {card.teamName}
                        </p>
                      </div>

                      {/* Record */}
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-base text-navy">
                          {card.wins}–{card.losses}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          W – L
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Manager Spotlight */}
            {isLoading ? (
              <SkeletonCard className="h-80" />
            ) : (
              <div className="bg-linear-to-br from-navy to-navy-light rounded-xl shadow-lg p-7 h-full">
                <p className="text-xs font-bold tracking-widest text-gold uppercase mb-5">
                  Manager Spotlight
                </p>
                <ManagerHighlight highlight={highlight} />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
});

export default Home;
