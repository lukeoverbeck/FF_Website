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

const WinnerCard = ({
  className,
  displayName,
  teamName,
  year,
  wins,
  losses,
  ...props
}) => {
  return (
    <Card className={cn("bg-slate-50", className)} {...props}>
      <CardHeader className="">
        <CardTitle className="flex items-center justify-center">
          <h3 className="border-b">{year}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9 border-2">
            <AvatarImage src="" alt="User Profile" />
            <AvatarFallback>LO</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">
              {displayName}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
              {teamName}
            </span>
          </div>
        </div>
        <div className="">
          <span className="text-sm font-semibold leading-none">
            {wins} - {losses}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinnerCard;
