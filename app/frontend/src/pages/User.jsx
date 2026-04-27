import MatchupBar from "../components/MatchupBar";
import UserInfo from "../components/UserInfo";
import UserStats from "../components/UserStats";
import { useState, useEffect, memo } from "react";
import { authFetch, logToBackend } from "../lib/utils";
import SkeletonCard from "../components/SkeletonCard";
import footballImage from "../assets/football.jpg";

const User = memo(({ year, currentRosterId }) => {
  const [userInfo, setUserInfo] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [matchupsData, setMatchupsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentRosterId) return;
    setIsLoading(true);
    setError(null);
    authFetch(`/api/user_dashboard/${year}/${currentRosterId}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(
              err.detail || "Failed to fetch user dashboard data"
            );
          });
        }
        return res.json();
      })
      .then((data) => {
        const user = data.roster_info;
        setUserInfo({
          id: user.display_name,
          teamName: user.team_name,
          displayName: user.display_name,
          profilePicture: user.profile_picture,
          playerNicknames: user.player_details || [],
        });
        setUserStats({
          id: user.display_name,
          year: user.season,
          totalRecord: `${user.total_wins}-${user.total_losses}`,
          headToHeadRecord: `${user.h2h_wins}-${user.h2h_losses}`,
          leagueMedianRecord: `${user.median_wins}-${user.median_losses}`,
          regularSeasonRank: user.regular_season_rank,
          pointsFor: user.points_for,
          pointsAgainst: user.points_against,
          isWinner: user.is_winner,
        });

        const formattedMatchupsArray = data.matchups.map((matchup) => {
          const innerUserMatchup = matchup.details.user_team.map((player) => ({
            pos: player.position,
            name: player.full_name,
            points: player.points,
            team: player.team,
            fantasy_pos: player.fantasy_position,
          }));

          const innerOpponentMatchup = matchup.details.opponent_team.map(
            (player) => ({
              pos: player.position,
              name: player.full_name,
              points: player.points,
              team: player.team,
              fantasy_pos: player.fantasy_position,
            })
          );

          matchup = matchup.summary;
          return {
            id: matchup.week,
            week: matchup.week,
            userScore: matchup.user_score,
            opponentScore: matchup.opponent_score,
            opponentName: matchup.opponent_team_name,
            userPlayers: innerUserMatchup,
            opponentPlayers: innerOpponentMatchup,
          };
        });

        setMatchupsData(formattedMatchupsArray);
        setIsLoading(false);
      })
      .catch((err) => {
        logToBackend(
          "error",
          `Failed to fetch user dashboard for roster_id=${currentRosterId}, season=${year} — ${err.message}`
        );
        setError(err.message);
        setIsLoading(false);
      });
  }, [year, currentRosterId]);

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
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-64 bg-linear-to-br from-navy via-navy-light to-navy">
        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />

        <img
          src={footballImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-10 mix-blend-luminosity"
        />

        {/* Hero text */}
        <div className="relative z-10 container mx-auto px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl mb-3">
            Manager Dashboard
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Track weekly matchups.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* User info + stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <SkeletonCard className="h-40" />
              <SkeletonCard className="h-40" />
            </>
          ) : (
            <>
              {userInfo && (
                <UserInfo
                  teamName={userInfo.teamName}
                  displayName={userInfo.displayName}
                  playerNicknames={userInfo.playerNicknames}
                  profilePicture={userInfo.profilePicture}
                />
              )}
              <UserStats
                year={userStats.year}
                totalRecord={userStats.totalRecord}
                headToHeadRecord={userStats.headToHeadRecord}
                leagueMedianRecord={userStats.leagueMedianRecord}
                regularSeasonRank={userStats.regularSeasonRank}
                pointsFor={userStats.pointsFor}
                pointsAgainst={userStats.pointsAgainst}
                isWinner={userStats.isWinner}
              />
            </>
          )}
        </div>

        {/* Matchups section label */}
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Matchups
        </p>

        {isLoading ? (
          <>
            {Array.from({ length: 14 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : (
          matchupsData.map((matchup) => (
            <MatchupBar key={matchup.id} {...matchup} />
          ))
        )}
      </div>
    </main>
  );
});

export default User;
