import { Search, X } from "lucide-react";

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedAssigneeFilter,
  onAssigneeFilterChange,
  members,
  isFilteringActive,
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="relative z-10 mb-6 p-4 bg-white/50 border border-white/70 backdrop-blur-md rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative flex-1 min-w-55">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Filter tasks by title or details..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400"
          />
        </div>

        <div className="relative min-w-45">
          <select
            value={selectedAssigneeFilter}
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
            className="w-full py-2 px-3 bg-white/80 border border-slate-200/80 text-xs font-medium text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="">All Assignees</option>
            {members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        {isFilteringActive && (
          <button
            onClick={onClearFilters}
            className="text-xs text-rose-600 font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-white shadow-2xs">
        Showing <span className="text-indigo-600">{filteredCount}</span> of{" "}
        {totalCount} tasks
      </div>
    </div>
  );
};
