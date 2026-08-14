import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Fetch existing notifications on load
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user?._id]);

  // 2. Initialize Socket.io Connection when authenticated
  useEffect(() => {
    if (!user?._id) return;

    fetchNotifications();

    const token = localStorage.getItem("token"); // or obtain from auth state
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification socket");
    });

    // Listen for real-time notification events
    newSocket.on("notification:new", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, fetchNotifications]); // Add fetchNotifications to dependency array

  // Mark a single item as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all items as read
  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Delete a single notification
  const deleteNotification = async (id) => {
    try {
      // Optimistically update the UI
      const notificationToRemove = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (notificationToRemove && !notificationToRemove.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Make the API call
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchNotifications(); // Re-fetch to sync state on error
    }
  };
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
