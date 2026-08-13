import { Pencil, X } from "lucide-react";
import { COLUMNS } from "./constants";
import { TaskDetailView } from "./TaskDetailView";
import { TaskEditForm } from "./TaskEditForm";

export const TaskDetailModal = ({
  task,
  isEditingTask,
  setIsEditingTask,
  editTaskData,
  setEditTaskData,
  project,
  isClient,
  isAdminOrManager,
  onClose,
  onSave,
  onDelete,
  onEditAssigneeToggle,
}) => {
  const currentStatus = isEditingTask ? editTaskData.status : task.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white/90 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Task Detail
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md capitalize">
              {COLUMNS.find((c) => c.id === currentStatus)?.title}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!isClient && !isEditingTask && (
              <button
                onClick={() => setIsEditingTask(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition"
              >
                <Pencil className="w-3 h-3" /> Edit Task
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isEditingTask ? (
          <TaskDetailView
            task={task}
            isAdminOrManager={isAdminOrManager}
            onDelete={onDelete}
            onClose={onClose}
          />
        ) : (
          <TaskEditForm
            project={project}
            editTaskData={editTaskData}
            setEditTaskData={setEditTaskData}
            onAssigneeToggle={onEditAssigneeToggle}
            onSubmit={onSave}
            onCancel={() => setIsEditingTask(false)}
          />
        )}
      </div>
    </div>
  );
};
