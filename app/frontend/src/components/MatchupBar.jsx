import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
// import MatchupDropdown from "./MatchupDropdown";

const MatchupBar = ({ userScore, opponentScore, opponentName, week }) => {
  const isWin = userScore > opponentScore;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="matchup-1"
        className="border rounded-xl bg-white shadow-sm overflow-hidden"
      >
        <AccordionTrigger className="py-6 px-6">
          <div className="flex items-center justify-between w-full pr-4">
            {/* Week + W/L Section */}
            <div className="flex items-center justify-center gap-10">
              <span className="text-xl font-bold">Week {week}</span>
              <span
                className={`text-xl font-bold uppercase px-2 py-0.5 ${
                  isWin ? "text-green-700" : "text-red-700"
                }`}
              >
                {isWin ? "W" : "L"}
              </span>
            </div>

            {/* Opponent Section */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-semibold lowercase tracking-wider text-muted-foreground">
                vs.
              </span>
              <span className="text-lg font-bold">{opponentName}</span>
            </div>

            {/* Score & Status Section */}
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black ${
                  isWin ? "text-blue-600" : "text-slate-900"
                }`}
              >
                {userScore}
              </span>
              <span className="text-xl font-bold text-slate-400">-</span>
              <span className="text-2xl font-bold text-slate-500">
                {opponentScore}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t bg-slate-50/50">
          {/* Pass the player information to the MatchupDropdown component here */}
          <h1>yo</h1>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MatchupBar;
