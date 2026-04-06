const ManagerHighlight = ({ highlight }) => {
  if (!highlight)
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;

  const { display_name, team_name, wins, losses, message } = highlight;

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">Manager Spotlight</h2>
      </div>

      {/* Manager info row */}
      <div className="flex items-center gap-3 border rounded-lg p-4 bg-slate-50">
        {/* Avatar placeholder */}
        <div className="shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
          {display_name.charAt(0)}
        </div>

        {/* Name + team */}
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-slate-900 text-base">
            {display_name}
          </span>
          <span className="text-sm text-slate-500">{team_name}</span>
        </div>

        {/* Record badge */}
        <div className="flex flex-col items-center bg-slate-800 text-white rounded-lg px-4 py-2 min-w-18">
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            Record
          </span>
          <span className="text-base font-bold">
            {wins}-{losses}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </div>
  );
};

export default ManagerHighlight;
