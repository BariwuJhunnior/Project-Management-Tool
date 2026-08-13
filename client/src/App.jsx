import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationBell } from "./components/NotificationBell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import KanbanBoard from "./pages/KanbanBoard";

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="relative z-30 bg-white/80 border-b border-slate-200/80 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-indigo-500/30">
            K
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-tight">
            TaskCraft
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell Dropdown */}
          <NotificationBell />

          <div className="text-right">
            <p className="text-xs font-bold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-slate-400 capitalize font-medium">
              {user?.role || "Member"}
            </p>
          </div>

          <button
            onClick={logout}
            className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <KanbanBoard />
                  </AppLayout>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
