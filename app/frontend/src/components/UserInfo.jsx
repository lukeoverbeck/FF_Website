import React from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// ─────────────────────────────────────────────
// UserInfo
// Identity card for the User Dashboard. Displays the manager's avatar, team name, and display name, followed
// by two derived detail rows: player nicknames and awards won. Both lists are formatted from their raw arrays
// into comma-separated strings before rendering, falling back to "None" when the arrays are empty.
// ─────────────────────────────────────────────
const UserInfo = ({
  teamName,
  displayName,
  profilePicture,
  playerNicknames = [],
  awardsWon = [],
  ...props
}) => {
  const formattedNicknames = playerNicknames
    // 1. Filter out entries where both nickname and name are missing
    .filter((item) => item.nickname || item.full_name)
    // 2. Format the remaining valid entries
    .map((item) => `${item.nickname} (${item.full_name})`)
    // 3. Join them into a single string
    .join(", ");
  const formattedAwards = awardsWon
    .map((item) => `${item.award} (${item.year})`)
    .join(", ");

  return (
    <Card className="h-full border-t-4 border-gold shadow-sm">
      <CardContent className="flex flex-col h-full justify-center gap-6 p-6">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-navy">
            <AvatarImage src={profilePicture} alt="User Profile" />
            <AvatarFallback className="bg-navy text-white font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-bold text-navy">{teamName}</span>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">
              {displayName}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <span className="font-bold text-navy">Player Nicknames: </span>
            <span className="text-slate-600">
              {formattedNicknames || "None"}
            </span>
          </div>
          <div>
            <span className="font-bold text-navy">Awards Won: </span>
            <span className="text-slate-600">{formattedAwards || "None"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
