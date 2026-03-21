import SettingsCard from "../components/SettingsCard";
import WinnerCard from "../components/WinnerCard";
import footballImage from "../assets/football.jpg";

const Home = () => (
  <main className="min-h-screen bg-slate-100">
    {/* This div keeps everything centered and bounded */}
    <div className="container mx-auto p-6 space-y-8">
      {/* Intro section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch bg-white p-6 rounded-xl shadow">
        {/* Left Column: Text */}
        <div className="flex flex-col border p-6 rounded-lg gap-2">
          <h1 className="text-3xl font-bold">
            Welcome to the Game of Inches Fantasy Home Page!
          </h1>
          <p className="text-slate-600 leading-relaxed">
            This is the site for everything about the Game of Inches fantasy
            football league.
          </p>
        </div>

        {/* Right Column: Image */}
        <figure className="overflow-hidden rounded-xl shadow-lg h-64 md:h-full">
          <img
            src={footballImage}
            alt="Fantasy Football League"
            className="w-full h-full object-cover"
          />
        </figure>
      </div>

      {/* Eventually pull from BigQuery */}
      <div className="grid grid-cols-12 gap-6">
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Number of Teams"
          settingsContent="12"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Roster Type"
          settingsContent="Keeper"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Scoring System"
          settingsContent="Half-PPR"
        />
        <SettingsCard
          className="col-span-12 md:col-span-3"
          settingsName="Waiver System"
          settingsContent="FAAB ($100)"
        />
      </div>
      <div className="flex flex-col gap-5 max-w-md mx-auto">
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
        <WinnerCard
          className=""
          winnerDisplayName="Luke Overbeck"
          winnerTeamName="Critical Chase Theory"
          winnerYear="2025"
        ></WinnerCard>
      </div>
    </div>
  </main>
);

export default Home;
