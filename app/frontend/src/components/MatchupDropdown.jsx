import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

// Define the lineup slots in the order they should be displayed
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

const MatchupDropdown = ({ userPlayers, opponentPlayers }) => {
  const splitIntoStartersAndBench = (players) => {
    const unassigned = [...players];
    const starters = [];

    // Assign each player to the first matching lineup slot
    for (const slot of LINEUP_SLOTS) {
      const matchIndex = unassigned.findIndex(
        (player) => player.fantasy_pos === slot
      );

      if (matchIndex !== -1) {
        // Use splice to remove the matched player from unassigned and add to starters
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

  // Split user and opponent players into starters and bench
  const { starters: userStarters, bench: userBench } =
    splitIntoStartersAndBench(userPlayers);
  const { starters: opponentStarters, bench: opponentBench } =
    splitIntoStartersAndBench(opponentPlayers);

  // Create matchup pairs for bench players, filling in empty slots as needed. Make the dropdown as long as the longest bench
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

  // Render a single row in the table
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
              <span className="font-semibold text-sm text-slate-700 gap-5">
                {userPlayer.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                {userPlayer.pos}-{userPlayer.team}
              </span>
            </div>
          )}
        </TableCell>

        {/* User Score */}
        <TableCell className="text-center py-4">
          <span
            className={`font-mono font-bold ${
              userIsEmpty ? "text-slate-200" : "text-slate-900"
            }`}
          >
            {userIsEmpty ? "0.00" : userPlayer.points.toFixed(2)}
          </span>
        </TableCell>

        {/* Slot Label */}
        <TableCell className="font-mono text-center text-xs font-bold text-slate-400 py-4">
          {slotLabel}
        </TableCell>

        {/* Opponent Score */}
        <TableCell className="text-center py-4">
          <span
            className={`font-mono font-bold ${
              opponentIsEmpty ? "text-slate-200" : "text-slate-900"
            }`}
          >
            {opponentIsEmpty ? "0.00" : opponentPlayer.points.toFixed(2)}
          </span>
        </TableCell>

        {/* Opponent Player Name */}
        <TableCell className="py-4">
          {opponentIsEmpty ? (
            <span className="text-slate-300 italic text-sm">Empty Slot</span>
          ) : (
            <div className="flex items-center gap-2 justify-end w-full">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                {opponentPlayer.pos}-{opponentPlayer.team}
              </span>
              <span className="font-semibold text-sm text-slate-700">
                {opponentPlayer.name}
              </span>
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              Luke O. Players
            </TableHead>
            <TableHead className="w-20 text-xs text-center font-bold uppercase text-muted-foreground">
              Pts
            </TableHead>
            <TableHead className="w-15 text-center text-xs font-black uppercase text-blue-600 bg-slate-100/50">
              Pos
            </TableHead>
            <TableHead className="w-20 text-xs text-center font-bold uppercase text-muted-foreground">
              Pts
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase text-muted-foreground">
              Team 2
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* For each user starter, render a row. Grab the matching player from opponent starters and index
          from LINEUP_SLOTS */}
          {userStarters.map((userPlayer, i) =>
            renderMatchupRow(
              userPlayer,
              opponentStarters[i],
              LINEUP_SLOTS[i],
              `starter-${i}`
            )
          )}

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
