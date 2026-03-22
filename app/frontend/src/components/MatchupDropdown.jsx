import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const MatchupDropdown = ({ players }) => {
  // This order is guaranteed by your backend:
  // QB, RB, RB, WR, WR, TE, FLEX, FLEX, DST

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            {/* Left Team Headers */}
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              Luke O. Players
            </TableHead>
            <TableHead className="w-20 text-xs text-center font-bold uppercase text-muted-foreground">
              Pts
            </TableHead>

            {/* Center Anchor */}
            <TableHead className="w-15 text-center text-xs font-black uppercase text-blue-600 bg-slate-100/50">
              Pos
            </TableHead>

            {/* Right Team Headers */}
            <TableHead className="w-20 text-xs text-center font-bold uppercase text-muted-foreground">
              Pts
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase text-muted-foreground">
              Team 2
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => {
            const isEmpty = player.name.toLowerCase() === "none";

            return (
              <TableRow
                key={index}
                className="hover:bg-slate-50/50 border-slate-100"
              >
                {/* Player Name*/}
                <TableCell className="py-4">
                  {isEmpty ? (
                    <span className="text-slate-300 italic text-sm">None</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-700 gap-5">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">
                        {player.pos}-{player.team}
                      </span>
                    </div>
                  )}
                </TableCell>

                {/* Score Column */}
                <TableCell className="text-center py-4">
                  <span
                    className={`font-mono font-bold ${
                      isEmpty ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {isEmpty ? "0.00" : player.points.toFixed(2)}
                  </span>
                </TableCell>

                {/* Position Label */}
                <TableCell className="font-mono text-center text-xs font-bold text-slate-400 py-4">
                  {player.pos}
                </TableCell>

                {/* Score Column */}
                <TableCell className="text-center py-4">
                  <span
                    className={`font-mono font-bold ${
                      isEmpty ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {isEmpty ? "0.00" : player.points.toFixed(2)}
                  </span>
                </TableCell>

                {/* Player Name & Team */}
                <TableCell className="py-4">
                  {isEmpty ? (
                    <span className="text-slate-300 italic text-sm">
                      Empty Slot
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 justify-end w-full">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">
                        {player.team}-{player.pos}
                      </span>
                      <span className="font-semibold text-sm text-slate-700">
                        {player.name}
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchupDropdown;
