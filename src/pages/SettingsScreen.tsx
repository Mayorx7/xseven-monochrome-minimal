import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2
} from "lucide-react";
import { supabase } from "../supabaseClient";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        navigate("/auth");
        return;
      }

      setUserId(userData.user.id);
      setEmail(userData.user.email || "");

      // Fetch alias
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias")
        .eq("id", userData.user.id)
        .single();

      if (profile) {
        setAlias(profile.alias || "");
      }

      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you sure?"
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "This is your last chance. Delete account permanently?"
    );
    if (!doubleConfirm) return;

    // Delete user's posts and chats (handled by CASCADE in DB)
    // Then delete auth user
    const { error } = await supabase.auth.admin.deleteUser(userId!);
    
    if (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please contact support.");
    } else {
      await supabase.auth.signOut();
      navigate("/welcome");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <p className="animate-pulse">LOADING SETTINGS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-green-700 p-4 flex items-center shadow-lg shadow-green-900/20 z-20">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-green-400 hover:text-green-300 transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1
          className="text-xl font-bold"
          style={{ textShadow: "0 0 5px #00ff00", letterSpacing: "0.05em" }}
        >
          SETTINGS
        </h1>
      </div>

      {/* Content */}
      <div className="pt-20 px-4 space-y-6 max-w-2xl mx-auto">
        
        {/* Account Info (Read-only) */}
        <div className="border-2 border-green-700 bg-green-900/10">
          <div className="border-b border-green-700 p-4 bg-green-900/20">
            <h2 className="text-lg font-bold text-green-400 flex items-center">
              <User className="mr-2 h-5 w-5" />
              ACCOUNT INFO
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center p-3 bg-black/30 border border-green-800">
              <span className="text-green-600 text-sm">Email</span>
              <span className="text-green-400 text-sm">{email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/30 border border-green-800">
              <span className="text-green-600 text-sm">Alias</span>
              <span className="text-green-400 text-sm">{alias}</span>
            </div>
            <p className="text-xs text-green-700 text-center pt-2">
              To edit your alias, go to Profile page
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="border-2 border-green-700 bg-green-900/10">
          <div className="border-b border-green-700 p-4 bg-green-900/20">
            <h2 className="text-lg font-bold text-green-400 flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              NOTIFICATIONS
            </h2>
          </div>
          
          <div className="p-4">
            <p className="text-center text-green-700 py-4 text-sm">
              Notification settings coming soon
            </p>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="border-2 border-green-700 bg-green-900/10">
          <div className="border-b border-green-700 p-4 bg-green-900/20">
            <h2 className="text-lg font-bold text-green-400 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              PRIVACY & SECURITY
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="p-3 bg-black/30 border border-green-800">
              <p className="text-green-400 font-semibold mb-1">Data Retention</p>
              <p className="text-xs text-green-700">
                All posts and chats are automatically deleted after 24 hours. 
                Your profile data (alias, email) is stored until you delete your account.
              </p>
            </div>

            <div className="p-3 bg-black/30 border border-green-800">
              <p className="text-green-400 font-semibold mb-1">Encryption</p>
              <p className="text-xs text-green-700">
                All data is encrypted in transit and at rest. Your communications are secure.
              </p>
            </div>

            <div className="p-3 bg-black/30 border border-green-800">
              <p className="text-green-400 font-semibold mb-1">Anonymous Browsing</p>
              <p className="text-xs text-green-700">
                Only your alias is visible to other users. Your email and personal data remain private.
              </p>
            </div>
          </div>
        </div>

        {/* App Info Section */}
        <div className="border-2 border-green-700 bg-green-900/10">
          <div className="border-b border-green-700 p-4 bg-green-900/20">
            <h2 className="text-lg font-bold text-green-400">
              APP INFO
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">Version</span>
                <span className="text-green-400">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Build</span>
                <span className="text-green-400">2025.01.11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Status</span>
                <span className="text-green-400">OPERATIONAL</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/about")}
              className="w-full p-3 bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 transition font-semibold"
            >
              VIEW HELP & RULES →
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-2 border-red-700 bg-red-900/10">
          <div className="border-b border-red-700 p-4 bg-red-900/20">
            <h2 className="text-lg font-bold text-red-400">
              DANGER ZONE
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-yellow-900/20 border-2 border-yellow-700 text-yellow-400 hover:bg-yellow-900/40 transition flex items-center justify-center gap-2 font-semibold"
            >
              <LogOut className="h-5 w-5" />
              LOGOUT
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 bg-red-900/20 border-2 border-red-700 text-red-400 hover:bg-red-900/40 transition flex items-center justify-center gap-2 font-semibold"
            >
              <Trash2 className="h-5 w-5" />
              DELETE ACCOUNT
            </button>

            <p className="text-xs text-red-600 text-center">
              ⚠️ Deleting your account is permanent and cannot be undone
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsScreen;
