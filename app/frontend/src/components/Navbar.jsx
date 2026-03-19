import React from "react";
import { Home, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Navbar = () => {
  // Eventually pull these from BigQuery
  const userName = "Luke O.";
  const userRole = "Commissioner";
  const leagueName = "Game of Inches";

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between px-6 py-3">
          {/* Navigation */}

          <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1 border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>User Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {/* Title */}
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full p-2 hover:bg-muted/50 hover:border transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl tracking-tight">
                {leagueName}
              </span>
            </div>
          </Link>
          {/* User Actions and Profile */}
          <div className="flex items-center gap-4">
            {/* Separator and Profile Info */}
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold leading-none">
                  {userName}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
                  {userRole}
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2">
                <AvatarImage src="" alt="User Profile" />
                <AvatarFallback>LO</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
