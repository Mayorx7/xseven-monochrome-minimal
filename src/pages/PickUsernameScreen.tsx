import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";

const DEFAULT_ALIAS = "Anonymousx7";

/* ---------------- THEMED UI ---------------- */

const ThemedButton = ({ children, className, disabled, ...props }) => (
  <button
    className={`p-3 font-semibold uppercase transition duration-200 rounded-lg 
      ${
        disabled
          ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
          : "bg-green-400 text-black shadow-[0_0_15px_rgba(0,255,0,0.7)] hover:bg-green-500 transform hover:scale-[1.02]"
      } ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const ThemedInput = ({ className, ...props }) => (
  <input
    className={`w-full p-3 bg-black/50 border-b-2 border-green-700 text-green-300 placeholder-green-800 
      focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none rounded-none font-mono transition duration-150 
      shadow-[0_0_8px_rgba(0,255,0,0.1)] ${className}`}
    {...props}
  />
);

const ErrorBox = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] p-6 w-full max-w-sm rounded-lg font-mono">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
        <h3 className="text-lg text-red-400 font-bold">ACCESS DENIED</h3>
      </div>
      <p className="text-sm text-gray-300 mb-6">
        ERROR CODE P409: {message}
      </p>
      <ThemedButton
        onClick={onClose}
        disabled={false}
        className="w-full bg-red-600 hover:bg-red-700 shadow-none border-none text-white"
        style={{ boxShadow: "0 0 10px rgba(255,0,0,0.5)" }}
      >
        ACKNOWLEDGE
      </ThemedButton>
    </div>
  </div>
);

/* ---------------- MAIN SCREEN ---------------- */

const PickUsernameScreen = ({ onDone }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

 const saveUsername = async () => {
  setLoading(true);
  setErrorMessage(null);

  if (!username.trim() || username.length < 3) {
    setErrorMessage("Alias must be at least 3 characters. RETRY.");
    setLoading(false);
    return;
  }

  // Get current user
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    setErrorMessage("Authentication token invalid. Cannot proceed.");
    setLoading(false);
    return;
  }

  const user = userData.user;
  const trimmedUsername = username.trim();

  // 🔹 Allow "Anonymousx7" for everyone, but check uniqueness for other aliases
  if (trimmedUsername.toLowerCase() !== "anonymousx7") {
    const { data: existing, error: checkErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", trimmedUsername)
      .neq("id", user.id)            // exclude current user
      .maybeSingle();

    if (checkErr) {
      setErrorMessage("Could not verify alias availability.");
      setLoading(false);
      return;
    }

    if (existing) {
      setErrorMessage("Alias already in use. Pick a different one.");
      setLoading(false);
      return;
    }
  }

  // 🔹 Update *this user's* alias
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      alias: trimmedUsername,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);            // update only current user's row

  setLoading(false);

  if (!updateErr) {
    navigate("/feed", { replace: true });
  } else {
    setErrorMessage(updateErr.message || "Update failed due to network error.");
  }
};


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && username.trim().length >= 3 && !loading) {
      saveUsername();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="w-full max-w-md bg-gray-900/50 border border-green-700 p-8 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <User className="w-8 h-8 text-green-400 mr-3" />
          <h1
            className="text-3xl font-bold"
            style={{ textShadow: "0 0 5px #00ff00" }}
          >
            ACCESS IDENTITY
          </h1>
        </div>

        <p className="text-sm text-green-500 mb-6 text-center">
          Establishing new system alias...
        </p>

        {/* Default alias selection */}
        <div className="mb-6 p-3 bg-gray-800/50 border border-green-800 rounded-lg shadow-inner shadow-green-900/50">
          <p className="text-xs text-green-500 mb-2 uppercase flex items-center">
            <CornerDownRight className="w-4 h-4 mr-1" /> Preferred System Alias
          </p>
          <div className="flex justify-between items-center">
            <span className="text-green-300 font-bold">{DEFAULT_ALIAS}</span>
            <button
              onClick={() => setUsername(DEFAULT_ALIAS)}
              className="text-xs p-1 px-2 border border-green-500 text-green-400 hover:text-green-200 uppercase transition duration-150 rounded"
              style={{
                boxShadow:
                  username === DEFAULT_ALIAS
                    ? "0 0 10px rgba(0,255,0,0.5)"
                    : "none",
              }}
            >
              {username === DEFAULT_ALIAS ? "SELECTED" : "[SELECT]"}
            </button>
          </div>
        </div>

        {/* Input field */}
        <ThemedInput
          type="text"
          placeholder="-- OR -- Enter custom alias"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          className="mb-8"
        />

        {/* Save button */}
        <ThemedButton
          onClick={saveUsername}
          disabled={loading || username.trim().length < 3}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⚙️</span> INITIATING UPLOAD...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <ArrowRight className="w-5 h-5 mr-2" />
              CONFIRM ALIAS
            </span>
          )}
        </ThemedButton>

        <div className="text-center mt-4 text-xs text-green-700">
          <CheckCircle className="w-4 h-4 inline mr-1" /> Profile initialization
          required for full network access.
        </div>
      </div>

      {/* Error modal */}
      {errorMessage && (
        <ErrorBox
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
};

export default PickUsernameScreen;
