import React from "react";
import { Card, CardContent } from "./ui/card";

const leagueMedianYears = ["2024", "2025"];

// ─────────────────────────────────────────────
// UserStats
// Season statistics card for the User Dashboard. Renders overall, H2H, and league median records at
// the top, then a rank + points section below. The layout switches from a two-column to a three-column
// grid when isWinner is true, inserting a gold trophy badge between the rank and points columns.
// H2H and league median rows are conditionally shown based on leagueMedianYears, since that scoring system
// was not tracked in earlier seasons.
// ─────────────────────────────────────────────
const UserStats = ({
  totalRecord,
  headToHeadRecord,
  leagueMedianRecord,
  regularSeasonRank,
  pointsFor,
  pointsAgainst,
  year,
  isWinner,
  ...props
}) => {
  return (
    <Card className="h-full border-t-4 border-gold shadow-sm">
      <CardContent className="flex flex-col h-full justify-center gap-6 p-6">
        {/* Records */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Overall Record
            </span>
            <span className="text-lg font-bold text-navy">{totalRecord}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">H2H Record</span>
            <span className="font-semibold text-navy">
              {leagueMedianYears.includes(String(year))
                ? headToHeadRecord
                : totalRecord}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">League Median</span>
            <span className="font-semibold text-slate-500">
              {leagueMedianYears.includes(String(year))
                ? leagueMedianRecord
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Rank + Points */}
        {!isWinner ? (
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Regular Season Rank
              </span>
              <span className="text-3xl font-black text-navy">
                {regularSeasonRank}
                <span className="text-lg">
                  {regularSeasonRank === 1
                    ? "st"
                    : regularSeasonRank === 2
                    ? "nd"
                    : regularSeasonRank === 3
                    ? "rd"
                    : "th"}
                </span>
              </span>
            </div>
            <div className="flex flex-col justify-between items-center border-l pl-4">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Total Points
              </span>
              <div className="flex items-center justify-between px-5 text-sm w-full">
                <span className="text-slate-500">For</span>
                <span className="font-semibold text-navy">{pointsFor}</span>
              </div>
              <div className="flex items-center justify-between px-5 text-sm w-full">
                <span className="text-slate-500">Against</span>
                <span className="font-semibold text-navy">{pointsAgainst}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-y-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Regular Season Rank
              </span>
              <span className="text-3xl font-black text-navy">
                {regularSeasonRank}
                <span className="text-lg">
                  {regularSeasonRank === 1
                    ? "st"
                    : regularSeasonRank === 2
                    ? "nd"
                    : regularSeasonRank === 3
                    ? "rd"
                    : "th"}
                </span>
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-l">
              <span className="text-4xl font-black text-gold">🏆 WINNER</span>
            </div>
            <div className="flex flex-col justify-between items-center border-l pl-4">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Total Points
              </span>
              <div className="flex items-center justify-between px-5 text-sm w-full">
                <span className="text-slate-500">For</span>
                <span className="font-semibold text-navy">{pointsFor}</span>
              </div>
              <div className="flex items-center justify-between px-5 text-sm w-full">
                <span className="text-slate-500">Against</span>
                <span className="font-semibold text-navy">{pointsAgainst}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;
