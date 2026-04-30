import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// ─────────────────────────────────────────────
// ManagerHighlight
// Displays the commissioner-curated spotlight inside the Home page's Manager Spotlight card. Renders an
// avatar, display name, team name, season record badge, and an optional free-text message. If highlight is
// null (data still loading), shows a pulse skeleton.
// ─────────────────────────────────────────────
const ManagerHighlight = ({ highlight }) => {
  if (!highlight)
    return <div className="animate-pulse bg-white/10 h-40 rounded-lg" />;

  const { display_name, team_name, wins, losses, message, profile_picture } =
    highlight;

  return (
    <div className="flex flex-col gap-4">
      {/* Manager info row */}
      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12 border-2 border-gold shrink-0">
          <AvatarImage src={profile_picture} alt={display_name} />
          <AvatarFallback className="bg-navy text-gold font-bold text-lg">
            {display_name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Name + team */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-bold text-white text-base">{display_name}</span>
          <span className="text-sm text-slate-300">{team_name}</span>
        </div>

        {/* Record badge */}
        <div className="flex flex-col items-center bg-gold text-navy rounded-lg px-4 py-2 min-w-18 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wide">
            Record
          </span>
          <span className="text-base font-black">
            {wins}-{losses}
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-slate-300 leading-relaxed wrap-break-word min-w-0">
          {message}
        </p>
      )}
    </div>
  );
};

export default ManagerHighlight;
