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
        className={`border rounded-xl bg-white shadow-sm overflow-hidden
          ${
            isWin
              ? "border-l-4 border-l-green-500"
              : isTie
              ? "border-l-4 border-l-slate-400"
              : "border-l-4 border-l-red-400"
          }
        `}
      >
        <AccordionTrigger className="hover:no-underline py-5 px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            {/* Week + W/L */}
            <div className="justify-self-start flex items-center gap-6">
              <span className="text-base font-bold text-navy">Week {week}</span>
              <span
                className={`text-sm font-bold uppercase px-2 py-0.5 rounded ${
                  isWin
                    ? "text-green-700 bg-green-50"
                    : isTie
                    ? "text-slate-600 bg-slate-100"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {isWin ? "W" : isTie ? "T" : "L"}
              </span>
            </div>

            {/* Opponent */}
            <div className="justify-self-center flex items-center gap-1">
              <span className="text-xs font-semibold lowercase tracking-wider text-slate-400">
                vs.
              </span>
              <span className="text-base font-bold text-navy">
                {opponentName}
              </span>
            </div>

            {/* Score */}
            <div className="justify-self-end">
              <div className="flex items-baseline gap-2 pr-4">
                <span
                  className={`font-black ${
                    isWin
                      ? "text-2xl text-green-700"
                      : isTie
                      ? "text-xl text-navy"
                      : "text-xl text-slate-400"
                  }`}
                >
                  {userScore.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-slate-300">–</span>
                <span
                  className={`font-black ${
                    isWin
                      ? "text-xl text-slate-400"
                      : isTie
                      ? "text-xl text-navy"
                      : "text-2xl text-red-600"
                  }`}
                >
                  {opponentScore.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="overflow-hidden">
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
