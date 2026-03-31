import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";

const UserInfo = ({
  teamName,
  displayName,
  playerNicknames = [],
  awardsWon = [],
  ...props
}) => {
  const formattedNicknames = playerNicknames
    .map((item) => `${item.nickname} (${item.full_name})`)
    .join(", ");

  const formattedAwards = awardsWon
    .map((item) => `${item.award} (${item.year})`)
    .join(", ");

  return (
    /* 1. h-full on the Card ensures it matches the grid cell height */
    <Card className="h-full">
      {/* 2. flex-1 and h-full on CardContent ensures the background/padding fills the Card */}
      <CardContent className="flex flex-col h-full justify-center gap-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2">
            <AvatarImage src="" alt="User Profile" />
            <AvatarFallback>LO</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{teamName}</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
              {displayName}
            </span>
          </div>
        </div>

        {/* 3. Using mt-auto here would push this section to the bottom if desired */}
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <span className="font-bold">Player Nicknames Created: </span>
            {formattedNicknames || "None"}
          </div>
          <div>
            <span className="font-bold">Awards Won: </span>
            {formattedAwards || "None"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
