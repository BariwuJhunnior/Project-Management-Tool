import { COLUMNS } from "./constants";

export const TaskEditForm = ({
  project,
  editTaskData,
  setEditTaskData,
  onAssigneeToggle,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Task Title
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={editTaskData.title}
          onChange={(e) =>
            setEditTaskData({ ...editTaskData, title: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="3"
          value={editTaskData.description}
          onChange={(e) =>
            setEditTaskData({
              ...editTaskData,
              description: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Assign Teammates
        </label>
        <div className="max-h-36 overflow-y-auto bg-white/60 border border-slate-200 rounded-xl p-2 space-y-1">
          {project?.members?.map((member) => {
            const isSelected = editTaskData.assignees.some((a) =>
              typeof a === "string" ? a === member._id : a._id === member._id,
            );
            return (
              <label
                key={member._id}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                  isSelected
                    ? "bg-indigo-50/90 text-indigo-900"
                    : "hover:bg-slate-100/70 text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onAssigneeToggle(member._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>{member.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 capitalize">
                  {member.role}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={editTaskData.status}
            onChange={(e) =>
              setEditTaskData({ ...editTaskData, status: e.target.value })
            }
          >
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Due Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={editTaskData.dueDate}
            onChange={(e) =>
              setEditTaskData({
                ...editTaskData,
                dueDate: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
