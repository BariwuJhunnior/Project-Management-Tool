import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { TeammateModal } from "../components/TeammateModal";
import { BoardHeader } from "../components/kanbanBoard/BoardHeader";
import { FilterBar } from "../components/kanbanBoard/FilterBar";
import { KanbanColumn } from "../components/kanbanBoard/KanbanColumn";
import { NewTaskModal } from "../components/kanbanBoard/NewTaskModal";
import { TaskDetailModal } from "../components/kanbanBoard/TaskDetailModal";
import { COLUMNS } from "../components/kanbanBoard/constants";

const KanbanBoard = ({ projectId: initialProjectId }) => {
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
      <BoardHeader
        project={project}
        projectsList={projectsList}
        activeProjectId={activeProjectId}
        onProjectChange={setActiveProjectId}
        isTeammateDropdownOpen={isTeammateDropdownOpen}
        onToggleTeammateDropdown={() =>
          setIsTeammateDropdownOpen((prev) => !prev)
        }
        onSelectTeammate={(member) => {
          setSelectedTeammate(member);
          setIsTeammateDropdownOpen(false);
        }}
        isClient={isClient}
        isAdminOrManager={isAdminOrManager}
        onNewTaskClick={() => setIsTaskModalOpen(true)}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssigneeFilter={selectedAssigneeFilter}
        onAssigneeFilterChange={setSelectedAssigneeFilter}
        members={project?.members}
        isFilteringActive={isFilteringActive}
        onClearFilters={() => {
          setSearchQuery("");
          setSelectedAssigneeFilter("");
        }}
        filteredCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={filteredTasks.filter((t) => t.status === col.id)}
            isFilteringActive={isFilteringActive}
            isClient={isClient}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskDragEnd={() => setIsDragging(false)}
            onTaskClick={handleTaskCardClick}
          />
        ))}
      </div>

      <TeammateModal
        teammate={selectedTeammate}
        onClose={() => setSelectedTeammate(null)}
      />

      {isTaskModalOpen && (
        <NewTaskModal
          project={project}
          newTaskData={newTaskData}
          setNewTaskData={setNewTaskData}
          onAssigneeToggle={handleAssigneeToggle}
          onSubmit={handleCreateTask}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}

      {activeTaskModal && (
        <TaskDetailModal
          task={activeTaskModal}
          isEditingTask={isEditingTask}
          setIsEditingTask={setIsEditingTask}
          editTaskData={editTaskData}
          setEditTaskData={setEditTaskData}
          project={project}
          isClient={isClient}
          isAdminOrManager={isAdminOrManager}
          onClose={() => setActiveTaskModal(null)}
          onSave={handleSaveTaskEdit}
          onDelete={handleDeleteTask}
          onEditAssigneeToggle={handleEditAssigneeToggle}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
