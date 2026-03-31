import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const UserStats = ({
  totalRecord,
  headToHeadRecord,
  leagueMedianRecord,
  regularSeasonRank,
  pointsFor,
  pointsAgainst,
  ...props
}) => {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col h-full justify-center gap-6 p-6">
        {/* Primary Records Section */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold uppercase text-muted-foreground">
              Overall Record
            </span>
            <span className="text-lg font-bold">{totalRecord}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>H2H Record:</span>
            <span className="font-semibold">{headToHeadRecord}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>League Median:</span>
            <span>{leagueMedianRecord}</span>
          </div>
        </div>

        {/* Rank and Points Section */}
        <div className="grid grid-cols-2 gap-y-4">
          <div className="flex flex-col items-center">
            <span className="font-bold">Season Rank</span>
            <span className="text-2xl font-black text-slate-800">
              {regularSeasonRank}
              {regularSeasonRank === 1
                ? "st"
                : regularSeasonRank === 2
                ? "nd"
                : regularSeasonRank === 3
                ? "rd"
                : "th"}
            </span>
          </div>
          <div className="flex flex-col justify-between items-center border-l pl-4">
            <span className="font-bold text-sm">Total Points</span>
            <div className="flex items-center justify-between px-5 text-sm w-full">
              <span>For:</span>
              <span className="font-semibold">{pointsFor}</span>
            </div>
            <div className="flex items-center justify-between px-5 text-sm w-full">
              <span>Against:</span>
              <span className="font-semibold">{pointsAgainst}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
