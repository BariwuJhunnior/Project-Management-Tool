import { ChevronDown, Users } from "lucide-react";

export const TeammatesDropdown = ({
  members,
  isOpen,
  onToggle,
  onSelectTeammate,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 bg-white/80 border border-white/90 hover:bg-white px-4 py-2 rounded-xl shadow-sm text-sm font-semibold text-slate-700 transition"
      >
        <Users className="w-4 h-4" />
        <span>Teammates</span>
        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
          {members?.length || 0}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/90 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-xl z-30 p-2 animate-fadeIn">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Assigned Team
          </p>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {members?.map((member) => (
              <button
                key={member._id}
                onClick={() => onSelectTeammate(member)}
                className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-indigo-50/80 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {member.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
