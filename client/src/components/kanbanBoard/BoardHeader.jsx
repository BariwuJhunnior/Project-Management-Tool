import { Plus } from "lucide-react";
import { TeammatesDropdown } from "./TeammatesDropdown";

export const BoardHeader = ({
  project,
  projectsList,
  activeProjectId,
  onProjectChange,
  isTeammateDropdownOpen,
  onToggleTeammateDropdown,
  onSelectTeammate,
  isClient,
  isAdminOrManager,
  onNewTaskClick,
}) => {
  return (
    <header className="relative z-20 mb-6 p-6 bg-white/60 border border-white/80 backdrop-blur-xl rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Active Project
          </span>
          <select
            value={activeProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="bg-white/80 border border-slate-200 text-slate-900 font-extrabold text-lg rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
          >
            {projectsList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          {project?.description ||
            "Manage tasks, track progress, and collaborate."}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <TeammatesDropdown
          members={project?.members}
          isOpen={isTeammateDropdownOpen}
          onToggle={onToggleTeammateDropdown}
          onSelectTeammate={onSelectTeammate}
        />

        {!isClient && (
          <button
            onClick={onNewTaskClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdminOrManager ? "New Task" : "Quick Task"}</span>
          </button>
        )}
      </div>
    </header>
  );
};
