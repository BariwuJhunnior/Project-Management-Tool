import { COLUMNS } from "./constants";

export const NewTaskModal = ({
  project,
  newTaskData,
  setNewTaskData,
  onAssigneeToggle,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white/80 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Create New Task
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Landing Page Wireframe"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTaskData.title}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
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
              placeholder="Brief summary of task requirements..."
              value={newTaskData.description}
              onChange={(e) =>
                setNewTaskData({
                  ...newTaskData,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Assign Teammates ({newTaskData.assignees.length} selected)
            </label>

            {newTaskData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {project?.members
                  ?.filter((m) => newTaskData.assignees.includes(m._id))
                  .map((m) => (
                    <span
                      key={m._id}
                      className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {m.name}
                      <button
                        type="button"
                        onClick={() => onAssigneeToggle(m._id)}
                        className="hover:text-indigo-900 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="max-h-36 overflow-y-auto bg-white/60 border border-slate-200 rounded-xl p-2 space-y-1">
              {project?.members?.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-1">
                  No team members assigned to project
                </p>
              ) : (
                project?.members?.map((member) => {
                  const isSelected = newTaskData.assignees.includes(
                    member._id,
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
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Initial Status
              </label>
              <select
                className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTaskData.status}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, status: e.target.value })
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
                value={newTaskData.dueDate}
                onChange={(e) =>
                  setNewTaskData({
                    ...newTaskData,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
