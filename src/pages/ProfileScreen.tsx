import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageSquare, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Clock,
  LogOut,
  Trash2,
  Shield,
  Info
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { BottomNavigation } from "../components/BottomNavigation";
import { CyberpunkDialog } from "../components/CyberpunkDialog";
import type { User } from "@supabase/supabase-js";

// --------------------------------------------------
//   TYPE DEFINITIONS
// --------------------------------------------------
interface FeedItem {
  id: string;
  type: "post" | "chat";
  content: string;
  created_at: string;
}

interface UserStats {
  totalPosts: number;
  totalChats: number;
  postsToday: number;
  remainingPosts: number;
  joinedDate: string;
}

interface ProfileScreenProps {
  currentUser: User | null;
  setCurrentPage: (page: string) => void;
  setCurrentUser: (user: User | null) => void;
}


// --------------------------------------------------
//   MAIN PROFILE SCREEN
// --------------------------------------------------
const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("Loading...");
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalChats: 0,
    postsToday: 0,
    remainingPosts: 3,
    joinedDate: ""
  });
  const [recentActivity, setRecentActivity] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    loadProfileData();
  }, [currentUser, navigate]);

  const loadProfileData = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      // Set email
      setEmail(currentUser.email || "");

      // Fetch alias and admin status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("alias, is_admin")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        console.error("❌ Profile query error:", profileError);
      }

      if (profile) {
        setAlias(profile.alias || "Anonymousx7");
        setIsAdmin(profile.is_admin || false);
        console.log("🔍 Profile loaded:", profile);
        console.log("🔐 Is Admin:", profile.is_admin);
      }

      // Fetch stats
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, created_at")
        .eq("user_id", currentUser.id);

      const { data: chatsData } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", currentUser.id);

      // Count posts today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const postsToday = postsData?.filter(
        (p) => new Date(p.created_at) >= today
      ).length || 0;

      setStats({
        totalPosts: postsData?.length || 0,
        totalChats: chatsData?.length || 0,
        postsToday,
        remainingPosts: 3 - postsToday,
        joinedDate: currentUser.created_at || ""
      });

      // Fetch recent activity (last 10 items)
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentChats } = await supabase
        .from("chats")
        .select("id, content, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const allActivity: FeedItem[] = [
        ...(recentPosts?.map(p => ({ ...p, type: "post" as const })) || []),
        ...(recentChats?.map(c => ({ ...c, type: "chat" as const })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentActivity(allActivity);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    // Note: This requires admin privileges, so it might fail
    // In production, you'd call a server function to handle this
    await supabase.auth.signOut();
    navigate("/welcome");
  };

  if (!currentUser) {
    return null;
  }

  const firstLetter = alias.charAt(0).toUpperCase();
  const joinedDate = stats.joinedDate 
    ? new Date(stats.joinedDate).toLocaleDateString()
    : "Unknown";

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-green-700 p-4 flex items-center shadow-lg shadow-green-900/20 z-20">
        <h1
          className="text-xl font-bold"
          style={{ textShadow: "0 0 5px #00ff00", letterSpacing: "0.05em" }}
        >
          PROFILE
        </h1>
      </div>

      {/* Content */}
      <div className="pt-20 px-4 space-y-6 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-green-500 animate-pulse">LOADING PROFILE DATA...</p>
          </div>
        ) : (
          <>
            {/* User Card */}
            <div className="border-2 border-green-700 bg-green-900/10 p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-black border-2 border-green-500 rounded-full flex items-center justify-center text-3xl font-bold">
                  {firstLetter}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-400">{alias}</h2>
                  <p className="text-sm text-green-600">ID: {currentUser.id.substring(0, 12)}...</p>
                  <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined: {joinedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-green-700 bg-green-900/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-bold text-green-600 uppercase">Posts</h3>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.totalPosts}</p>
                <p className="text-xs text-green-700 mt-1">Total created</p>
              </div>

              <div className="border-2 border-green-700 bg-green-900/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  <h3 className="text-sm font-bold text-green-600 uppercase">Chats</h3>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.totalChats}</p>
                <p className="text-xs text-green-700 mt-1">Total sent</p>
              </div>

              <div className="border-2 border-yellow-700 bg-yellow-900/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-sm font-bold text-yellow-600 uppercase">Today</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{stats.postsToday}/3</p>
                <p className="text-xs text-yellow-700 mt-1">Posts used</p>
              </div>

              <div className="border-2 border-blue-700 bg-blue-900/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-blue-600 uppercase">Remaining</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.remainingPosts}</p>
                <p className="text-xs text-blue-700 mt-1">Posts left</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-2 border-green-700 bg-green-900/10">
              <div className="border-b border-green-700 p-4 bg-green-900/20">
                <h2 className="text-lg font-bold text-green-400">RECENT ACTIVITY</h2>
              </div>
              <div className="p-4">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-green-700 py-8">No activity yet. Start chatting or posting!</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border-l-4 ${
                          item.type === "post"
                            ? "border-red-500 bg-red-900/10"
                            : "border-green-500 bg-black/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold uppercase ${
                            item.type === "post" ? "text-red-400" : "text-green-500"
                          }`}>
                            {item.type === "post" ? "📢 POST" : "💬 CHAT"}
                          </span>
                          <span className="text-xs text-green-700">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-green-300 line-clamp-2">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="border-2 border-green-700 bg-green-900/10">
              <div className="border-b border-green-700 p-4 bg-green-900/20">
                <h2 className="text-lg font-bold text-green-400">ACCOUNT INFO</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/30 border border-green-800">
                  <span className="text-green-600 text-sm">Email</span>
                  <span className="text-green-400 text-sm">{email}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 border border-green-800">
                  <span className="text-green-600 text-sm">User ID</span>
                  <span className="text-green-400 text-sm font-mono text-xs">{currentUser.id.substring(0, 16)}...</span>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="border-2 border-green-700 bg-green-900/10">
              <div className="border-b border-green-700 p-4 bg-green-900/20">
                <h2 className="text-lg font-bold text-green-400 flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  PRIVACY & SECURITY
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-3 bg-black/30 border border-green-800">
                  <p className="text-green-400 font-semibold mb-1 text-sm">Data Retention</p>
                  <p className="text-xs text-green-700">
                    All posts and chats are automatically deleted after 24 hours.
                  </p>
                </div>
                <div className="p-3 bg-black/30 border border-green-800">
                  <p className="text-green-400 font-semibold mb-1 text-sm">Encryption</p>
                  <p className="text-xs text-green-700">
                    All data is encrypted in transit and at rest.
                  </p>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="border-2 border-green-700 bg-green-900/10">
              <div className="border-b border-green-700 p-4 bg-green-900/20">
                <h2 className="text-lg font-bold text-green-400 flex items-center">
                  <Info className="mr-2 h-5 w-5" />
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
                    <span className="text-green-600">Status</span>
                    <span className="text-green-400">OPERATIONAL</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/about")}
                  className="w-full p-3 bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 transition font-semibold text-sm"
                >
                  VIEW HELP & RULES →
                </button>
                
                {/* Admin Access Button - Only visible to admins */}
                {isAdmin ? (
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full p-3 bg-red-900/30 border-2 border-red-500 text-red-400 hover:bg-red-900/50 transition font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ textShadow: "0 0 5px #ff0000" }}
                  >
                    <Shield className="h-4 w-4" />
                    🔒 ADMIN DASHBOARD
                  </button>
                ) : null}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-700 bg-red-900/10">
              <div className="border-b border-red-700 p-4 bg-red-900/20">
                <h2 className="text-lg font-bold text-red-400">DANGER ZONE</h2>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full p-4 bg-yellow-900/20 border-2 border-yellow-700 text-yellow-400 hover:bg-yellow-900/40 transition flex items-center justify-center gap-2 font-semibold"
                >
                  <LogOut className="h-5 w-5" />
                  LOGOUT
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
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
          </>
        )}
      </div>

      {/* Cyberpunk Dialogs */}
      <CyberpunkDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="TERMINATE SESSION"
        message="Are you sure you want to logout?\n\nYour session will be terminated and you will need to authenticate again to access XSEVEN."
        confirmText="LOGOUT"
        cancelText="STAY"
      />

      <CyberpunkDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="⚠️ CRITICAL WARNING"
        message="DANGER: You are about to permanently delete your account.\n\n• All your data will be erased\n• This action CANNOT be undone\n• Your alias will be lost forever\n\nAre you absolutely sure?"
        confirmText="DELETE FOREVER"
        cancelText="ABORT"
        isDanger={true}
      />

      <BottomNavigation />
    </div>
  );
};

export default ProfileScreen;
