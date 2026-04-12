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
import { useState, useEffect } from "react";
import { authFetch } from "../lib/utils";
import SkeletonCard from "./SkeletonCard";

const Navbar = ({ currentYear, currentRosterId, onYearChange, setToken }) => {
  const navigate = useNavigate();
  const [userCard, setUserCard] = useState({
    display_name: "",
    team_name: "",
    profile_picture: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentRosterId) return; // Don't fetch until we have the roster ID
    setIsLoading(true);
    setError(null);
    authFetch(`/api/navbar/${currentRosterId}/${currentYear}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.detail || "Failed to fetch navbar data");
          });
        }
        return res.json();
      })
      .then((data) => {
        setUserCard(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [currentYear, currentRosterId]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 container mx-auto h-16">
          {/* Navigation */}
          <div className="justify-self-start flex items-center gap-1 rounded-full bg-muted/40 p-1 border shadow">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => navigate("/home")}
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
                  onClick={() => navigate("/user")}
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
            to="/home"
            className="justify-self-center flex items-center gap-2 rounded-full p-2 hover:bg-muted/50 hover:border hover:shadow transition-colors"
          >
            <span className="font-bold text-xl tracking-tight">
              Game of Inches
            </span>
          </Link>

          {/* User Actions and Profile */}
          <div className="justify-self-end flex items-center gap-4">
            {error ? (
              <span className="text-sm text-muted-foreground">
                Could not load profile: {error}
              </span>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="hidden md:flex flex-col items-end">
                  {isLoading ? (
                    <div className="flex flex-col gap-1">
                      <SkeletonCard className="h-3 w-8" />
                      <SkeletonCard className="h-3 w-8" />
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold leading-none">
                        {userCard.team_name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider mt-1">
                        {userCard.display_name}
                      </span>
                    </>
                  )}
                </div>

                {isLoading ? (
                  <SkeletonCard className="h-8 w-8 rounded-full" />
                ) : (
                  <>
                    <Avatar className="h-9 w-9 border-2">
                      <AvatarImage
                        src={userCard.profile_picture}
                        alt="User Profile"
                      />
                      <AvatarFallback>
                        {userCard?.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}

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
                <nav>
                  {/* 3. Use the setter in your dropdown or buttons */}
                  <select
                    value={currentYear}
                    onChange={(e) => onYearChange(e.target.value)}
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </nav>
              </div>
            )}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
