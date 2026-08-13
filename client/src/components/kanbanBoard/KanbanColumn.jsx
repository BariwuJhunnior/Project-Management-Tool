import { TaskCard } from "./TaskCard";

export const KanbanColumn = ({
  column,
  tasks,
  isFilteringActive,
  isClient,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskClick,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      className="bg-white/40 border border-white/60 backdrop-blur-lg rounded-2xl p-4 flex flex-col h-[70vh] shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${column.color}`}
        >
          {column.title}
        </span>
        <span className="text-xs font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full border border-white">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300/60 rounded-xl text-xs text-slate-400 font-medium text-center p-2">
            {isFilteringActive ? "No matching tasks" : "Drop tasks here"}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isClient={isClient}
              onDragStart={onTaskDragStart}
              onDragEnd={onTaskDragEnd}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
};
