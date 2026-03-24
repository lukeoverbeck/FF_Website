import MatchupBar from "../components/MatchupBar";
import UserInfo from "../components/UserInfo";
import UserStats from "../components/UserStats";

const User = () => {
  // 1. Define your data (this would eventually come from an API or DB)
  const matchups = [
    {
      week: 1,
      userScore: 85,
      opponentScore: 92,
      opponentName: "Default Dan",
    },
    {
      week: 2,
      userScore: 110,
      opponentScore: 105,
      opponentName: "Gridiron Greats",
    },
    {
      week: 3,
      userScore: 95,
      opponentScore: 95,
      opponentName: "Tie Fighter",
    },
    {
      week: 4,
      userScore: 72,
      opponentScore: 88,
      opponentName: "Blitz King",
    },
    {
      week: 5,
      userScore: 10,
      opponentScore: 10,
      opponentName: "Critical Chase Theory",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="container mx-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <UserInfo
            teamName="Critical Chase Theory"
            displayName="Luke Overbeck"
            playerNicknames={[
              { player: "Justin Jefferson", nickname: "The Flash" },
              { player: "AJ Brown", nickname: "Lord and Savior" },
            ]}
            awardsWon={[{ award: "Manager of the Year", year: "2025" }]}
          ></UserInfo>
          <UserStats
            year={2025}
            totalRecord="21-7"
            headToHeadRecord="10-4"
            leagueMedianRecord="11-3"
            regularSeasonRank="5th"
            pointsFor={1500}
            pointsAgainst={1200}
          ></UserStats>
        </div>

        <div>
          <h1 className="text-center text-3xl font-bold">
            <span className="border-b">Matchups</span>
          </h1>
        </div>

        {/* 2. Map through the matchups array */}
        {matchups.map((match) => (
          <MatchupBar
            key={match.week} // Always use a unique key for list items
            week={match.week}
            userScore={match.userScore}
            opponentScore={match.opponentScore}
            opponentName={match.opponentName}
          />
        ))}
      </div>
    </main>
  );
};

export default User;
