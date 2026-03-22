import MatchupBar from "../components/MatchupBar";

const User = () => (
  <main className="min-h-screen bg-slate-100">
    <div className="container mx-auto p-6 space-y-8">
      <MatchupBar
        userScore="10"
        opponentScore="10"
        opponentName="Critical Chase Theory"
        week="5"
      ></MatchupBar>
    </div>
  </main>
);

export default User;
