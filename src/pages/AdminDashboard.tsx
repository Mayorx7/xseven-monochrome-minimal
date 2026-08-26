import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Shield,
  Ban,
  Trash2,
  Clock,
  RefreshCw
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { CyberpunkDialog } from "../components/CyberpunkDialog";

interface Analytics {
  total_users: number;
  total_posts: number;
  total_chats: number;
  posts_today: number;
  chats_today: number;
  active_users_today: number;
  banned_users: number;
}

interface User {
  id: string;
  alias: string;
  is_banned: boolean;
  banned_until: string | null;
  ban_reason: string | null;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  alias: string;
}

interface Chat {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  alias: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "content">("analytics");
  
  // Dialog states
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedContent, setSelectedContent] = useState<{id: string, type: "post" | "chat"} | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState(24);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isAdmin]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel("admin-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        console.log("📢 Posts updated - refreshing...");
        loadDashboardData();
      })
      .subscribe();

    // Subscribe to new chats
    const chatsSubscription = supabase
      .channel("admin-chats")
      .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, () => {
        console.log("💬 Chats updated - refreshing...");
        loadDashboardData();
      })
      .subscribe();

    // Subscribe to profile changes (bans, etc)
    const profilesSubscription = supabase
      .channel("admin-profiles")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        console.log("👤 Profiles updated - refreshing...");
        loadDashboardData();
      })
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      chatsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.is_admin) {
      alert("ACCESS DENIED: Admin privileges required");
      navigate("/feed");
      return;
    }

    setIsAdmin(true);
    loadDashboardData();
  };

  const loadDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load analytics
      const { data: analyticsData } = await supabase.rpc("get_admin_analytics");
      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Load users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (usersData) {
        setUsers(usersData);
      }

      // Load recent posts with user aliases
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles!inner(alias)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (postsData) {
        setPosts(postsData.map((p: any) => ({
          ...p,
          alias: p.profiles.alias
        })));
      }

      // Load recent chats with user aliases
      const { data: chatsData } = await supabase
        .from("chats")
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles!inner(alias)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (chatsData) {
        setChats(chatsData.map((c: any) => ({
          ...c,
          alias: c.profiles.alias
        })));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    try {
      await supabase.rpc("ban_user", {
        p_admin_id: userData.user.id,
        p_user_id: selectedUser.id,
        p_duration_hours: banDuration,
        p_reason: banReason
      });

      loadDashboardData();
      setBanReason("");
      setBanDuration(24);
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    try {
      await supabase.rpc("unban_user", {
        p_admin_id: userData.user.id,
        p_user_id: userId
      });

      loadDashboardData();
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert("Failed to unban user");
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedContent) return;

    try {
      if (selectedContent.type === "post") {
        await supabase.from("posts").delete().eq("id", selectedContent.id);
      } else {
        await supabase.from("chats").delete().eq("id", selectedContent.id);
      }

      loadDashboardData();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <p className="animate-pulse">LOADING ADMIN DASHBOARD...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono pb-6">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-red-700 p-4 flex items-center justify-between shadow-lg shadow-red-900/20 z-20">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/feed")}
            className="mr-4 text-red-400 hover:text-red-300 transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1
            className="text-xl font-bold text-red-400"
            style={{ textShadow: "0 0 5px #ff0000", letterSpacing: "0.05em" }}
          >
            🔒 ADMIN DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-green-600">
            <Clock className="h-3 w-3 inline mr-1" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className={`p-2 border border-green-700 text-green-400 hover:bg-green-900/30 transition ${
              isRefreshing ? "animate-spin" : ""
            }`}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4 space-y-6 max-w-7xl mx-auto">
        
        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-red-700">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "analytics"
                ? "text-red-400 border-b-2 border-red-400 -mb-0.5"
                : "text-green-700 hover:text-green-500"
            }`}
          >
            ANALYTICS
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "users"
                ? "text-red-400 border-b-2 border-red-400 -mb-0.5"
                : "text-green-700 hover:text-green-500"
            }`}
          >
            USERS
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "content"
                ? "text-red-400 border-b-2 border-red-400 -mb-0.5"
                : "text-green-700 hover:text-green-500"
            }`}
          >
            CONTENT
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-green-700 bg-green-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-400" />
                <h3 className="text-sm font-bold text-green-600 uppercase">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{analytics.total_users}</p>
            </div>

            <div className="border-2 border-blue-700 bg-blue-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-blue-600 uppercase">Active Today</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{analytics.active_users_today}</p>
            </div>

            <div className="border-2 border-red-700 bg-red-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-sm font-bold text-red-600 uppercase">Posts</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">{analytics.total_posts}</p>
              <p className="text-xs text-red-700 mt-1">Today: {analytics.posts_today}</p>
            </div>

            <div className="border-2 border-yellow-700 bg-yellow-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-yellow-600 uppercase">Chats</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{analytics.total_chats}</p>
              <p className="text-xs text-yellow-700 mt-1">Today: {analytics.chats_today}</p>
            </div>

            <div className="border-2 border-red-700 bg-red-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="h-5 w-5 text-red-400" />
                <h3 className="text-sm font-bold text-red-600 uppercase">Banned Users</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">{analytics.banned_users}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="border-2 border-green-700 bg-green-900/10">
            <div className="border-b border-green-700 p-4 bg-green-900/20">
              <h2 className="text-lg font-bold text-green-400">USER MANAGEMENT</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 border-2 ${
                      user.is_banned ? "border-red-500 bg-red-900/20" : "border-green-700 bg-black/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-green-400">{user.alias}</p>
                          {user.is_banned && (
                            <span className="text-xs px-2 py-1 bg-red-900/50 border border-red-500 text-red-400">
                              BANNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-green-700 font-mono">ID: {user.id.substring(0, 16)}...</p>
                        <p className="text-xs text-green-700">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.is_banned && user.ban_reason && (
                          <p className="text-xs text-red-400 mt-1">Reason: {user.ban_reason}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {user.is_banned ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 transition text-sm"
                          >
                            UNBAN
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanDialog(true);
                            }}
                            className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50 transition text-sm"
                          >
                            BAN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Posts */}
            <div className="border-2 border-red-700 bg-red-900/10">
              <div className="border-b border-red-700 p-4 bg-red-900/20">
                <h2 className="text-lg font-bold text-red-400">RECENT POSTS</h2>
              </div>
              <div className="p-4 space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="p-3 border-l-4 border-red-500 bg-black/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-red-400">{post.alias}</span>
                          <span className="text-xs text-green-700">
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-green-300">{post.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedContent({ id: post.id, type: "post" });
                          setShowDeleteDialog(true);
                        }}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chats */}
            <div className="border-2 border-green-700 bg-green-900/10">
              <div className="border-b border-green-700 p-4 bg-green-900/20">
                <h2 className="text-lg font-bold text-green-400">RECENT CHATS</h2>
              </div>
              <div className="p-4 space-y-2">
                {chats.map((chat) => (
                  <div key={chat.id} className="p-3 border-l-4 border-green-500 bg-black/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-green-400">{chat.alias}</span>
                          <span className="text-xs text-green-700">
                            {new Date(chat.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-green-300">{chat.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedContent({ id: chat.id, type: "chat" });
                          setShowDeleteDialog(true);
                        }}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ban User Dialog */}
      {showBanDialog && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
          <div className="relative w-full max-w-md border-2 border-red-500 bg-black p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4">BAN USER: {selectedUser.alias}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-green-600 block mb-2">Duration (hours)</label>
                <input
                  type="number"
                  value={banDuration}
                  onChange={(e) => setBanDuration(parseInt(e.target.value))}
                  className="w-full p-3 bg-black/50 border border-green-700 text-green-400 focus:border-green-400 outline-none"
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-sm text-green-600 block mb-2">Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-green-700 text-green-400 focus:border-green-400 outline-none resize-none"
                  rows={3}
                  placeholder="Enter ban reason..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBanDialog(false);
                  setSelectedUser(null);
                  setBanReason("");
                  setBanDuration(24);
                }}
                className="flex-1 p-3 bg-black border-2 border-green-700 text-green-400 hover:bg-green-900/30 transition font-semibold"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  handleBanUser();
                  setShowBanDialog(false);
                  setSelectedUser(null);
                }}
                className="flex-1 p-3 bg-red-900/30 border-2 border-red-500 text-red-400 hover:bg-red-900/50 transition font-semibold"
              >
                BAN USER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Content Dialog */}
      <CyberpunkDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedContent(null);
        }}
        onConfirm={handleDeleteContent}
        title="DELETE CONTENT"
        message={`Are you sure you want to delete this ${selectedContent?.type}?\n\nThis action cannot be undone.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        isDanger={true}
      />
    </div>
  );
};

export default AdminDashboard;
