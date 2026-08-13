import { Mail, MessageSquare, X } from "lucide-react";

export const TeammateModal = ({ teammate, onClose }) => {
  if (!teammate) return null;

  // Uses your backend schema field: `whatsApp`
  const whatsappClean = teammate.whatsApp
    ? teammate.whatsApp.replace(/[^0-9]/g, "")
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white/80 border border-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Avatar Header */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200/60">
          <div className="w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-3 ring-4 ring-white/80">
            {teammate.name ? teammate.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{teammate.name}</h3>
          <span className="mt-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {teammate.role || "Developer"}
          </span>
        </div>

        {/* Details List */}
        <div className="mt-5 space-y-4 text-sm">
          <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl border border-white/80">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Email Address
              </p>
              <a
                href={`mailto:${teammate.email}`}
                className="text-indigo-600 font-medium hover:underline"
              >
                {teammate.email}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl border border-white/80">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 font-medium">WhatsApp</p>
              {teammate.whatsApp ? (
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
                >
                  {teammate.whatsApp}
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
