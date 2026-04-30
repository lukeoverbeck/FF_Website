import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

// ─────────────────────────────────────────────
// MatchupDropdown
// Detailed side-by-side player table rendered inside an expanded MatchupBar. Receives raw player arrays
// for both teams and splits each into starters and bench before rendering. Displays a mirrored table layout:
// user players on the left, opponent on the right, with the fantasy position slot in the center column.
// ─────────────────────────────────────────────
// ── LINEUP_SLOTS: canonical starter slot order ──
// Used to assign players to specific positional slots by matching each player's fantasy_pos against this
// ordered list. Unmatched slots render an empty placeholder.
const LINEUP_SLOTS = [
  "QB",
  "RB",
  "RB",
  "WR",
  "WR",
  "TE",
  "FLEX",
  "FLEX",
  "DST",
];

const MatchupDropdown = ({
  userPlayers,
  opponentPlayers,
  userScore,
  opponentScore,
  isWin,
  isTie,
}) => {
  // ── splitIntoStartersAndBench ──
  // Iterates LINEUP_SLOTS in order, greedily matching the first
  // available player whose fantasy_pos fits each slot. Matched
  // players are spliced out of the working copy so they can't be
  // double-assigned. Any remaining players become the bench array.
  const splitIntoStartersAndBench = (players) => {
    const unassigned = [...players];
    const starters = [];

    for (const slot of LINEUP_SLOTS) {
      const matchIndex = unassigned.findIndex(
        (player) => player.fantasy_pos === slot
      );
      if (matchIndex !== -1) {
        starters.push(unassigned.splice(matchIndex, 1)[0]);
      } else {
        starters.push({
          name: "none",
          fantasy_pos: slot,
          pos: slot,
          team: "",
          points: 0,
        });
      }
    }

    return { starters, bench: unassigned };
  };

  const { starters: userStarters, bench: userBench } =
    splitIntoStartersAndBench(userPlayers);
  const { starters: opponentStarters, bench: opponentBench } =
    splitIntoStartersAndBench(opponentPlayers);

  // ── Bench pairing: zip both bench arrays by index ──
  // Pads the shorter side with empty slot placeholders so
  // every bench row always has both a user and opponent cell.
  const longestBench = Math.max(userBench.length, opponentBench.length);
  const benchMatchups = Array.from({ length: longestBench }, (_, i) => ({
    userBenchPlayer: userBench[i] || {
      name: "none",
      fantasy_pos: "BN",
      team: "",
      points: 0,
    },
    opponentBenchPlayer: opponentBench[i] || {
      name: "none",
      fantasy_pos: "BN",
      team: "",
      points: 0,
    },
  }));

  // ── renderMatchupRow ──
  // Shared row renderer for both starters and bench sections.
  // Empty slots ("none") render italicised placeholder text instead of a name and show 0.00 in a muted style.
  const renderMatchupRow = (userPlayer, opponentPlayer, slotLabel, rowKey) => {
    const userIsEmpty = userPlayer.name.toLowerCase() === "none";
    const opponentIsEmpty = opponentPlayer.name.toLowerCase() === "none";

    return (
      <TableRow key={rowKey} className="hover:bg-slate-50/50 border-slate-100">
        {/* User Player Name */}
        <TableCell className="py-4">
          {userIsEmpty ? (
            <span className="text-slate-300 italic text-sm">None</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-navy">
                {userPlayer.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase">
                {userPlayer.pos}-{userPlayer.team}
              </span>
            </div>
          )}
        </TableCell>

        {/* User Score */}
        <TableCell className="text-center py-4">
          <span
            className={`font-mono font-bold ${
              userIsEmpty ? "text-slate-200" : "text-navy"
            }`}
          >
            {userIsEmpty ? "0.00" : userPlayer.points.toFixed(2)}
          </span>
        </TableCell>

        {/* Slot Label — gold instead of blue */}
        <TableCell className="font-mono text-center text-xs font-bold text-gold py-4">
          {slotLabel}
        </TableCell>

        {/* Opponent Score */}
        <TableCell className="text-center py-4">
          <span
            className={`font-mono font-bold ${
              opponentIsEmpty ? "text-slate-200" : "text-navy"
            }`}
          >
            {opponentIsEmpty ? "0.00" : opponentPlayer.points.toFixed(2)}
          </span>
        </TableCell>

        {/* Opponent Player Name */}
        <TableCell className="py-4">
          {opponentIsEmpty ? (
            <div className="flex items-center justify-end">
              <span className="text-slate-300 italic text-sm">Empty Slot</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] text-slate-400 font-medium uppercase">
                {opponentPlayer.pos}-{opponentPlayer.team}
              </span>
              <span className="font-semibold text-sm text-navy">
                {opponentPlayer.name}
              </span>
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  // ── Render: starters table → total score row → bench divider → bench rows ──
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[35%] text-xs font-bold uppercase text-slate-400">
              Your Players
            </TableHead>
            <TableHead className="w-[12%] text-xs text-center font-bold uppercase text-slate-400">
              Pts
            </TableHead>
            {/* Pos header — gold to match slot labels */}
            <TableHead className="w-[6%] text-center text-xs font-black uppercase text-gold">
              Pos
            </TableHead>
            <TableHead className="w-[12%] text-xs text-center font-bold uppercase text-slate-400">
              Pts
            </TableHead>
            <TableHead className="w-[35%] text-right text-xs font-bold uppercase text-slate-400">
              Opponent Players
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userStarters.map((userPlayer, i) =>
            renderMatchupRow(
              userPlayer,
              opponentStarters[i],
              LINEUP_SLOTS[i],
              `starter-${i}`
            )
          )}

          {/* Total Score Row */}
          <TableRow className="hover:bg-transparent border-none">
            <TableCell className="py-3" />
            <TableCell className="text-center py-3">
              <span
                className={`text-lg font-mono font-black ${
                  isWin
                    ? "text-green-700"
                    : isTie
                    ? "text-navy"
                    : "text-slate-400"
                }`}
              >
                {userScore.toFixed(2)}
              </span>
            </TableCell>
            <TableCell className="text-center py-3">
              {/* "Total" label — gold to match theme */}
              <span className="text-[10px] font-black uppercase text-gold">
                Total
              </span>
            </TableCell>
            <TableCell className="text-center py-3">
              <span
                className={`font-mono font-black ${
                  isWin
                    ? "text-slate-400"
                    : isTie
                    ? "text-navy"
                    : "text-2xl text-red-600"
                }`}
              >
                {opponentScore.toFixed(2)}
              </span>
            </TableCell>
            <TableCell className="py-3" />
          </TableRow>

          {/* Bench Divider */}
          {longestBench > 0 && (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="py-1 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Bench
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Bench Players */}
          {benchMatchups.map(({ userBenchPlayer, opponentBenchPlayer }, i) =>
            renderMatchupRow(
              userBenchPlayer,
              opponentBenchPlayer,
              "BN",
              `bench-${i}`
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchupDropdown;
