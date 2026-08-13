import { CalendarDays } from "lucide-react";

export const TaskCard = ({
  task,
  isClient,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  return (
    <div
      draggable={!isClient}
      onDragStart={(e) => onDragStart(e, task._id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="group relative bg-white/80 border border-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer hover:border-indigo-300"
    >
      <h4 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {task.dueDate ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            <CalendarDays className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : (
          <span />
        )}

        <div className="flex -space-x-1.5 overflow-hidden">
          {task.assignees?.map((a) => (
            <div
              key={a._id}
              title={a.name}
              className="w-6 h-6 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            >
              {a.name ? a.name.charAt(0).toUpperCase() : "U"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
