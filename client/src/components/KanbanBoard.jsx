import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { TeammateModal } from "./TeammateModal";
import {
  CalendarDays,
  ChevronDown,
  Folder,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    color: "border-sky-400/60 bg-sky-500/10 text-sky-700",
  },
  {
    id: "team",
    title: "Team Members",
    color: "border-indigo-400/60 bg-indigo-500/10 text-indigo-700",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "border-amber-400/60 bg-amber-500/10 text-amber-700",
  },
  {
    id: "review",
    title: "Review",
    color: "border-purple-400/60 bg-purple-500/10 text-purple-700",
  },
  {
    id: "done",
    title: "Done",
    color: "border-emerald-400/60 bg-emerald-500/10 text-emerald-700",
  },
];

export const KanbanBoard = ({ projectId: initialProjectId }) => {
  const { user } = useAuth();

  // Multi-Project State
  const [projectsList, setProjectsList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(
    initialProjectId || "",
  );

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState("");

  // Teammates dropdown & detail modal state
  const [isTeammateDropdownOpen, setIsTeammateDropdownOpen] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState(null);

  // New Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    assignees: [],
    status: "todo",
    dueDate: "",
  });

  // Task Card Click / Detail / Edit Modal State
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Role permissions
  const isAdminOrManager =
    user?.role === "admin" || user?.role === "project_manager";
  const isClient = user?.role === "client";

  // Fetch available projects list on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjectsList(data);
        if (!activeProjectId && data.length > 0) {
          setActiveProjectId(data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching project list:", err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch Board and Task data whenever activeProjectId changes
  useEffect(() => {
    const fetchBoardData = async () => {
      if (!activeProjectId) return;
      try {
        setLoading(true);
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${activeProjectId}`),
          api.get(`/tasks/project/${activeProjectId}`),
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Error fetching Kanban data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [activeProjectId]);

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    if (isClient) return;
    setIsDragging(true);
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setIsDragging(false);
    if (isClient) return;

    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t)),
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update task status:", err);
      const res = await api.get(`/tasks/project/${activeProjectId}`);
      setTasks(res.data);
    }
  };

  // Filter Tasks dynamically
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAssignee = selectedAssigneeFilter
      ? task.assignees?.some((a) => a._id === selectedAssigneeFilter)
      : true;

    return matchesSearch && matchesAssignee;
  });

  const isFilteringActive =
    searchQuery.trim() !== "" || selectedAssigneeFilter !== "";

  // Toggle Assignees selection in task creation form
  const handleAssigneeToggle = (memberId) => {
    setNewTaskData((prev) => {
      const exists = prev.assignees.includes(memberId);
      const updatedAssignees = exists
        ? prev.assignees.filter((id) => id !== memberId)
        : [...prev.assignees, memberId];
      return { ...prev, assignees: updatedAssignees };
    });
  };

  // Toggle Assignees selection in edit mode form
  const handleEditAssigneeToggle = (memberId) => {
    setEditTaskData((prev) => {
      const exists = prev.assignees.some((a) =>
        typeof a === "string" ? a === memberId : a._id === memberId,
      );
      let updatedAssignees;
      if (exists) {
        updatedAssignees = prev.assignees.filter((a) =>
          typeof a === "string" ? a !== memberId : a._id !== memberId,
        );
      } else {
        const fullMember = project?.members?.find((m) => m._id === memberId);
        updatedAssignees = [...prev.assignees, fullMember || memberId];
      }
      return { ...prev, assignees: updatedAssignees };
    });
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/tasks", {
        ...newTaskData,
        project: activeProjectId,
      });
      setTasks([data, ...tasks]);
      setIsTaskModalOpen(false);
      setNewTaskData({
        title: "",
        description: "",
        assignees: [],
        status: "todo",
        dueDate: "",
      });
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Open Detailed Task View Modal
  const handleTaskCardClick = (task) => {
    if (isDragging) return;
    setActiveTaskModal(task);
    setEditTaskData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignees: task.assignees || [],
    });
    setIsEditingTask(false);
  };

  // Update Task Handler
  const handleSaveTaskEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editTaskData,
        assignees: editTaskData.assignees.map((a) =>
          typeof a === "string" ? a : a._id,
        ),
      };
      const { data } = await api.put(`/tasks/${activeTaskModal._id}`, payload);

      setTasks((prev) =>
        prev.map((t) => (t._id === activeTaskModal._id ? data : t)),
      );
      setActiveTaskModal(data);
      setIsEditingTask(false);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${activeTaskModal._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== activeTaskModal._id));
      setActiveTaskModal(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Loading Glass Kanban Board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-200 to-indigo-50 p-6 text-slate-800">
      {/* 1. GLASS PROJECT HEADER WITH PROJECT SWITCHER */}
      <header className="relative z-20 mb-6 p-6 bg-white/60 border border-white/80 backdrop-blur-xl rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Active Project
            </span>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-white/80 border border-slate-200 text-slate-900 font-extrabold text-lg rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              {projectsList.map((p) => (
                <option key={p._id} value={p._id}>
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 inline-block" /> {p.title}
                  </div>
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
          {/* Teammates Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsTeammateDropdownOpen(!isTeammateDropdownOpen)}
              className="flex items-center space-x-2 bg-white/80 border border-white/90 hover:bg-white px-4 py-2 rounded-xl shadow-sm text-sm font-semibold text-slate-700 transition"
            >
              <Users className="w-4 h-4" />
              <span>Teammates</span>
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {project?.members?.length || 0}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isTeammateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/90 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-xl z-30 p-2 animate-fadeIn">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Assigned Team
                </p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {project?.members?.map((member) => (
                    <button
                      key={member._id}
                      onClick={() => {
                        setSelectedTeammate(member);
                        setIsTeammateDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-indigo-50/80 transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                        {member.name
                          ? member.name.charAt(0).toUpperCase()
                          : "U"}
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

          {/* Action Button */}
          {!isClient && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdminOrManager ? "New Task" : "Quick Task"}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="relative z-10 mb-6 p-4 bg-white/50 border border-white/70 backdrop-blur-md rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-55">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Filter tasks by title or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400"
            />
          </div>

          {/* Assignee Filter Dropdown */}
          <div className="relative min-w-45">
            <select
              value={selectedAssigneeFilter}
              onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
              className="w-full py-2 px-3 bg-white/80 border border-slate-200/80 text-xs font-medium text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="">
                <User className="w-3 h-3 inline-block mr-1" /> All Assignees
              </option>
              {project?.members?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFilteringActive && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAssigneeFilter("");
              }}
              className="text-xs text-rose-600 font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Results Counter */}
        <div className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-white shadow-2xs">
          Showing{" "}
          <span className="text-indigo-600">{filteredTasks.length}</span> of{" "}
          {tasks.length} tasks
        </div>
      </div>

      {/* 3. 5-COLUMN KANBAN CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-white/40 border border-white/60 backdrop-blur-lg rounded-2xl p-4 flex flex-col h-[70vh] shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${col.color}`}
                >
                  {col.title}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full border border-white">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300/60 rounded-xl text-xs text-slate-400 font-medium text-center p-2">
                    {isFilteringActive
                      ? "No matching tasks"
                      : "Drop tasks here"}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable={!isClient}
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={() => setIsDragging(false)}
                      onClick={() => handleTaskCardClick(task)}
                      className={`group relative bg-white/80 border border-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer hover:border-indigo-300`}
                    >
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {task.title}
                      </h4>
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TEAMMATE MODAL */}
      <TeammateModal
        teammate={selectedTeammate}
        onClose={() => setSelectedTeammate(null)}
      />

      {/* 4. NEW TASK CREATION MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white/80 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Create New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
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

              {/* TEAMMATE ASSIGNEES MULTI-SELECT */}
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
                            onClick={() => handleAssigneeToggle(m._id)}
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
                              onChange={() => handleAssigneeToggle(member._id)}
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
                  onClick={() => setIsTaskModalOpen(false)}
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
      )}

      {/* 5. TASK DETAILS & EDIT MODAL */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white/90 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 relative">
            {/* Header Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Task Detail
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md capitalize">
                  {
                    COLUMNS.find(
                      (c) =>
                        c.id ===
                        (isEditingTask
                          ? editTaskData.status
                          : activeTaskModal.status),
                    )?.title
                  }
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
                  onClick={() => setActiveTaskModal(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Read-Only Details Mode */}
            {!isEditingTask ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {activeTaskModal.title}
                  </h2>
                  <p className="text-sm text-slate-600 bg-slate-50/70 border border-slate-200/60 p-3 rounded-xl min-h-[80px]">
                    {activeTaskModal.description ||
                      "No detailed description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div className="p-3 bg-white/60 border border-slate-200/60 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Due Date
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {activeTaskModal.dueDate
                        ? new Date(activeTaskModal.dueDate).toLocaleDateString()
                        : "No Due Date"}
                    </span>
                  </div>

                  <div className="p-3 bg-white/60 border border-slate-200/60 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Created On
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {activeTaskModal.createdAt
                        ? new Date(
                            activeTaskModal.createdAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Assigned Teammates List */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Assigned Team
                  </span>
                  {activeTaskModal.assignees?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No team members assigned
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {activeTaskModal.assignees?.map((a) => (
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

                {/* Actions Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-6">
                  {isAdminOrManager ? (
                    <button
                      onClick={handleDeleteTask}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Task
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => setActiveTaskModal(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Task Mode Form */
              <form onSubmit={handleSaveTaskEdit} className="space-y-4">
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
                      setEditTaskData({
                        ...editTaskData,
                        title: e.target.value,
                      })
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

                {/* Edit Assignees Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Assign Teammates
                  </label>
                  <div className="max-h-36 overflow-y-auto bg-white/60 border border-slate-200 rounded-xl p-2 space-y-1">
                    {project?.members?.map((member) => {
                      const isSelected = editTaskData.assignees.some((a) =>
                        typeof a === "string"
                          ? a === member._id
                          : a._id === member._id,
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
                              onChange={() =>
                                handleEditAssigneeToggle(member._id)
                              }
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
                        setEditTaskData({
                          ...editTaskData,
                          status: e.target.value,
                        })
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
                    onClick={() => setIsEditingTask(false)}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
