import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import MatchupDropdown from "./MatchupDropdown";

const MatchupBar = ({
  userScore,
  opponentScore,
  opponentName,
  week,
  userPlayers,
  opponentPlayers,
}) => {
  const isWin = userScore > opponentScore;
  const isTie = userScore === opponentScore;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="matchup-1"
        className="border rounded-xl bg-white shadow-sm overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline py-6 px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            {/* Week + W/L Section */}
            <div className="justify-self-start flex items-center justify-center gap-10">
              <span className="text-xl font-bold">Week {week}</span>
              <span
                className={`text-xl font-bold uppercase px-2 py-0.5 ${
                  isWin
                    ? "text-green-700"
                    : isTie
                    ? "text-slate-700"
                    : "text-red-700"
                }`}
              >
                {isWin ? "W" : isTie ? "T" : "L"}
              </span>
            </div>

            {/* Opponent Section */}
            <div className="justify-self-center flex items-center justify-center gap-1">
              <span className="text-sm font-semibold lowercase tracking-wider text-muted-foreground">
                vs.
              </span>
              <span className="text-lg font-bold">{opponentName}</span>
            </div>

            {/* Score & Status Section */}
            <div className="justify-self-end">
              <div className="flex items-baseline gap-2 pr-4">
                <span
                  className={`text-2xl font-black ${
                    isWin
                      ? "text-3xl text-green-700"
                      : isTie
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {userScore.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-slate-400">-</span>
                <span
                  className={`text-2xl font-black ${
                    isWin
                      ? "text-slate-500"
                      : isTie
                      ? "text-slate-900"
                      : "text-3xl text-red-700"
                  }`}
                >
                  {opponentScore.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="overflow-hidden">
          {/* Pass the player information to the MatchupDropdown component here */}
          <div className="border-t bg-slate-50/50 p-6">
            <MatchupDropdown
              userPlayers={userPlayers}
              opponentPlayers={opponentPlayers}
              userScore={userScore}
              opponentScore={opponentScore}
              isWin={isWin}
              isTie={isTie}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MatchupBar;
