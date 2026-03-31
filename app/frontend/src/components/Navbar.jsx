import React from "react";
import { Home, Users, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
            <span className="font-bold text-xl tracking-tight">
              {leagueName}
            </span>
          </Link>

          {/* User Actions and Profile */}
          <div className="flex items-center gap-4">
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
