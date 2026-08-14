import React, { useState, useEffect } from "react";
import api from "../../api/axios";

export const NewProjectModal = ({
  isOpen,
  onClose,
  onProjectCreated,
  currentUser,
}) => {
  const [allUsers, setAllUsers] = useState([]);
  const [newProjectData, setNewProjectData] = useState({
    title: "",
    description: "",
    members: [currentUser._id], // Pre-select the creator
  });

  useEffect(() => {
    if (isOpen) {
      const fetchAllUsers = async () => {
        try {
          const { data } = await api.get("/auth/users");
          setAllUsers(data);
        } catch (err) {
          console.error("Error fetching all users:", err);
        }
      };
      fetchAllUsers();
    }
  }, [isOpen]);

  const handleProjectMemberToggle = (userId) => {
    setNewProjectData((prev) => {
      const exists = prev.members.includes(userId);
      const updatedMembers = exists
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members: updatedMembers };
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data: newProject } = await api.post("/projects", newProjectData);
      onProjectCreated(newProject);
      onClose();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white/80 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Create New Project
        </h3>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New Mobile App"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newProjectData.title}
              onChange={(e) =>
                setNewProjectData({ ...newProjectData, title: e.target.value })
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
              placeholder="A short description of the project's goals..."
              value={newProjectData.description}
              onChange={(e) =>
                setNewProjectData({
                  ...newProjectData,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Assign Team Members ({newProjectData.members.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto bg-white/60 border border-slate-200 rounded-xl p-2 space-y-1">
              {allUsers.map((u) => {
                const isSelected = newProjectData.members.includes(u._id);
                return (
                  <label
                    key={u._id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition ${isSelected ? "bg-indigo-50/90 text-indigo-900" : "hover:bg-slate-100/70 text-slate-700"}`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleProjectMemberToggle(u._id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <span>{u.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {u.role}
                    </span>
                  </label>
                );
              })}
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
