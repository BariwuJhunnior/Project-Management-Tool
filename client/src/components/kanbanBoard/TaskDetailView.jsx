import { Trash2 } from "lucide-react";

export const TaskDetailView = ({
  task,
  isAdminOrManager,
  onDelete,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {task.title}
        </h2>
        <p className="text-sm text-slate-600 bg-slate-50/70 border border-slate-200/60 p-3 rounded-xl min-h-[80px]">
          {task.description || "No detailed description provided."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
        <div className="p-3 bg-white/60 border border-slate-200/60 rounded-xl">
          <span className="block text-[10px] font-bold text-slate-400 uppercase">
            Due Date
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "No Due Date"}
          </span>
        </div>

        <div className="p-3 bg-white/60 border border-slate-200/60 rounded-xl">
          <span className="block text-[10px] font-bold text-slate-400 uppercase">
            Created On
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {task.createdAt
              ? new Date(task.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>

      <div>
        <span className="block text-xs font-bold text-slate-400 uppercase mb-2">
          Assigned Team
        </span>
        {task.assignees?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No team members assigned
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {task.assignees?.map((a) => (
              <div
                key={a._id}
                className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs px-3 py-1.5 rounded-xl font-semibold"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {a.name ? a.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-6">
        {isAdminOrManager ? (
          <button
            onClick={onDelete}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition"
          >
            <Trash2 className="w-3 h-3" /> Delete Task
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
