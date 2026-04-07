import MatchupBar from "../components/MatchupBar";
import UserInfo from "../components/UserInfo";
import UserStats from "../components/UserStats";
import { useState, useEffect } from "react";
import { authFetch } from "../lib/utils";
import SkeletonCard from "../components/SkeletonCard";

const User = ({ year, currentRosterId }) => {
  const [userInfo, setUserInfo] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [matchupsData, setMatchupsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentRosterId) return; // Don't fetch until we have the roster ID
    setIsLoading(true);
    authFetch(`/api/user_dashboard/${year}/${currentRosterId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const user = data.roster_info;
        setUserInfo({
          id: user.display_name, // Not really necessary here
          teamName: user.team_name,
          displayName: user.display_name,
          profilePicture: user.profile_picture,
          playerNicknames: user.player_details || [],
        });
        setUserStats({
          id: user.display_name, // Not really necessary here
          year: user.season,
          totalRecord: `${user.total_wins}-${user.total_losses}`,
          headToHeadRecord: `${user.h2h_wins}-${user.h2h_losses}`,
          leagueMedianRecord: `${user.median_wins}-${user.median_losses}`,
          regularSeasonRank: user.regular_season_rank,
          pointsFor: user.points_for,
          pointsAgainst: user.points_against,
        });

        console.log("Raw Matchups:", data.matchups);

        const formattedMatchupsArray = data.matchups.map((matchup) => {
          const innerUserMatchup = matchup.details.user_team.map((player) => {
            return {
              pos: player.position,
              name: player.full_name,
              points: player.points,
              team: player.team,
              fantasy_pos: player.fantasy_position,
            };
          });

          const innerOpponentMatchup = matchup.details.opponent_team.map(
            (player) => {
              return {
                pos: player.position,
                name: player.full_name,
                points: player.points,
                team: player.team,
                fantasy_pos: player.fantasy_position,
              };
            }
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

        console.log("Formatted matchups:", formattedMatchupsArray);

        setMatchupsData(formattedMatchupsArray);
        setIsLoading(false);
      });
  }, [year, currentRosterId]); // Runs every time the year OR user changes

  return (
    <>
      <main className="min-h-screen bg-slate-100">
        <div className="container mx-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
                />
              </>
            )}
          </div>

          <div>
            <h1 className="text-center text-3xl font-bold">
              <span className="border-b">Matchups</span>
            </h1>
          </div>

          {/* 2. Map through the matchups array */}
          {isLoading ? (
            <>
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
              <SkeletonCard className="" />
            </>
          ) : (
            matchupsData.map((matchup) => (
              <MatchupBar
                key={matchup.id} // Always use a unique key for list items
                {...matchup} // Spread the matchup properties as props to MatchupBar
              />
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default User;
