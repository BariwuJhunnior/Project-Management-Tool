import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Bell, BellRing, Megaphone, X } from "lucide-react";

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/80 border border-white/90 hover:bg-white transition shadow-xs text-slate-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white/90 border border-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Dropdown Header */}
          <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-white/50">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium flex flex-col items-center gap-2">
                <BellRing className="w-6 h-6 text-slate-300" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={(e) => {
                    // Prevent marking as read if the delete button was clicked
                    if (e.target.closest(".delete-notification-btn")) return;
                    if (!n.read) {
                      markAsRead(n._id);
                    }
                  }}
                  className={`p-3.5 transition flex items-start space-x-3 cursor-pointer ${
                    !n.read
                      ? "bg-indigo-50/50 hover:bg-indigo-50/80"
                      : "hover:bg-slate-50/60 opacity-80"
                  }`}
                >
                  {/* Sender Avatar or Icon */}
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {n.sender?.name ? (
                      n.sender.name.charAt(0).toUpperCase()
                    ) : (
                      <Megaphone className="w-4 h-4" />
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-slate-800 font-medium leading-snug">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-col items-center ml-auto pl-2">
                    {/* Unread Status Dot */}
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2 mb-2" />
                    )}
                    {/* Delete Button */}
                    <button
                      className="delete-notification-btn text-slate-300 hover:text-rose-500 transition-colors"
                      onClick={() => deleteNotification(n._id)}
                      title="Delete notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
