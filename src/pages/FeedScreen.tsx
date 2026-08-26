import React, { useState, useEffect, useRef } from "react";
import { Send, Plus, CornerUpRight, Shield, Bell } from "lucide-react";
import { supabase } from "../supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { BottomNavigation } from "../components/BottomNavigation";
import { FeedItemWithReplies } from "../components/FeedItemWithReplies";
import { notificationService } from "../services/notificationService";
import { useNotifications } from "../hooks/useNotifications";

// --- THEMED UI PLACEHOLDERS ---
const ThemedButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; isAccent?: boolean }
> = ({ children, className, isAccent = false, ...props }) => (
  <button
    className={`p-3 rounded-lg font-semibold uppercase transition duration-200 
                    ${
                      isAccent
                        ? "bg-green-400 text-black shadow-[0_0_10px_rgba(0,255,0,0.5)] hover:bg-green-500"
                        : "bg-black text-green-400 border border-green-700 hover:border-green-400"
                    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const ThemedInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => (
  <input
    className={`w-full p-3 bg-black/50 border border-green-700 text-green-400 placeholder-green-800 
                    focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none rounded-none font-mono transition duration-150 
                    ${className}`}
    {...props}
  />
);

const ThemedBottomNavigation: React.FC = () => (
  <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-green-700 flex justify-around items-center text-green-400 font-mono text-sm z-20">
    <div className="p-2 cursor-pointer hover:text-green-200">TERMINAL</div>
    <div className="p-2 cursor-pointer hover:text-green-200">NETWORK</div>
    <div className="p-2 cursor-pointer hover:text-green-200">SETTINGS</div>
  </div>
);

// Deprecated - now using FeedItemWithReplies component
const ThemedPost: React.FC<{ item: FeedItem }> = ({ item }) => (
  <div className="border border-red-500 bg-red-900/10 p-4 rounded-lg shadow-[0_0_10px_rgba(255,0,0,0.3)] border-l-4 mb-3">
    <div className="flex items-center mb-2">
      <CornerUpRight className="w-4 h-4 text-red-400 mr-2 transform rotate-90" />
      <p className="text-red-400 text-xs font-bold uppercase">
        // SYSTEM ALERT: {item.username} ({item.timestamp.toLocaleTimeString()})
      </p>
    </div>
    <p className="text-white font-mono text-sm leading-snug">{item.content}</p>
  </div>
);

// Deprecated - now using FeedItemWithReplies component
const ThemedChat: React.FC<{ item: FeedItem; isCurrentUser: boolean }> = ({ item, isCurrentUser }) => (
  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
    {isCurrentUser ? (
      // Your messages - double square ring style
      <div className="max-w-[75%] relative ml-auto">
        {/* Outer square ring */}
        <div className="absolute inset-0 border-2 border-green-700/40" style={{ transform: 'translate(-4px, -4px)' }}></div>
        
        {/* Inner content box */}
        <div className="relative p-3 border-2 bg-black/80 border-green-700/60">
          <p className="text-xs font-semibold mb-1 tracking-wider font-mono text-green-500/90">
            {item.username}
          </p>
          <p className="text-sm font-mono leading-relaxed text-green-400/90">
            {item.content}
          </p>
        </div>
      </div>
    ) : (
      // Other users' messages - strong left green highlight
      <div className="max-w-[75%] bg-gray-900/70 border-l-4 border-green-500 mr-auto p-3 pl-4">
        <p className="text-green-500 text-xs font-semibold mb-1 tracking-wider">
          {item.username}
        </p>
        <p className="text-green-300 text-sm">
          {item.content}
        </p>
      </div>
    )}
  </div>
);

// --- MAIN FEED COMPONENT ---
interface FeedItem {
  id: string;
  type: "post" | "chat";
  content: string;
  username: string;
  timestamp: Date;
  parentId?: string;
  user_id?: string;
}

interface DbPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface DbChat {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const FeedScreen = () => {
  const [message, setMessage] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [alias, setAlias] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [remainingPosts, setRemainingPosts] = useState(3);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [chatLockTimeRemaining, setChatLockTimeRemaining] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminViewEnabled, setAdminViewEnabled] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Notifications
  const { unreadCount } = useNotifications(currentUserId);

  // ✅ Fetch logged-in user's alias and ID
  useEffect(() => {
    const fetchAlias = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setAlias("Anonymousx7");
        setCurrentUserId(null);
        return;
      }

      setCurrentUserId(userData.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("alias, is_admin")
        .eq("id", userData.user.id)
        .single();

      if (error) {
        console.error("Alias fetch error:", error.message);
        setAlias("Anonymousx7");
        return;
      }

      setIsAdmin(profile?.is_admin || false);

      setAlias(profile?.alias || "Anonymousx7");
      
      // Initialize notifications for logged-in users
      if (userData.user.id) {
        notificationService.initialize(userData.user.id);
      }
    };

    fetchAlias();
  }, []);

  // ✅ Timer logic
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();

      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeUntilReset(
        `${hours.toString().padStart(2, "0")}h:${minutes
          .toString()
          .padStart(2, "0")}m:${seconds.toString().padStart(2, "0")}s`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Helper function to get alias for a user_id
  const getUserAlias = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("alias")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return "Anonymousx7";
    }
    return data.alias || "Anonymousx7";
  };

  // ✅ Load feed items from database on mount
  useEffect(() => {
    const loadFeedItems = async () => {
      setIsLoading(true);

      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: true });

        if (postsError) {
          console.error("Error loading posts:", postsError);
        }

        // Fetch chats
        const { data: chatsData, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .order("created_at", { ascending: true });

        if (chatsError) {
          console.error("Error loading chats:", chatsError);
        }

        // Get unique user IDs
        const userIds = new Set<string>();
        postsData?.forEach((post) => userIds.add(post.user_id));
        chatsData?.forEach((chat) => userIds.add(chat.user_id));

        // Fetch all aliases at once
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, alias")
          .in("id", Array.from(userIds));

        const aliasMap = new Map<string, string>();
        profilesData?.forEach((profile) => {
          aliasMap.set(profile.id, profile.alias || "Anonymousx7");
        });

        // Convert posts to FeedItems
        const postItems: FeedItem[] =
          postsData?.map((post: DbPost) => ({
            id: post.id,
            type: "post" as const,
            content: post.content,
            username: aliasMap.get(post.user_id) || "Anonymousx7",
            timestamp: new Date(post.created_at),
            user_id: post.user_id,
          })) || [];

        // Convert chats to FeedItems
        const chatItems: FeedItem[] =
          chatsData?.map((chat: DbChat) => ({
            id: chat.id,
            type: "chat" as const,
            content: chat.content,
            username: aliasMap.get(chat.user_id) || "Anonymousx7",
            timestamp: new Date(chat.created_at),
            user_id: chat.user_id,
          })) || [];

        // Add static welcome message
        const welcomeMessage: FeedItem = {
          id: "welcome-system-message",
          type: "post",
          content: "SYSTEM BREACH DETECTED. Connection established. You are now part of the network. All transmissions are encrypted. Proceed with caution.",
          username: "XSEVEN_CORE",
          timestamp: new Date(0), // Set to epoch so it appears first
          user_id: "system",
        };

        // Combine and sort by timestamp
        const allItems = [welcomeMessage, ...postItems, ...chatItems].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        setFeedItems(allItems);
      } catch (error) {
        console.error("Error loading feed items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedItems();
  }, []);

  // ✅ Set up real-time subscriptions
  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel("feed-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          console.log("📬 Real-time post received:", payload);
          const newPost = payload.new as DbPost;
          const username = await getUserAlias(newPost.user_id);

          const newFeedItem: FeedItem = {
            id: newPost.id,
            type: "post",
            content: newPost.content,
            username,
            timestamp: new Date(newPost.created_at),
            user_id: newPost.user_id,
          };

          setFeedItems((prev) => {
            // Avoid duplicates
            if (prev.some(item => item.id === newFeedItem.id)) {
              return prev;
            }
            return [...prev, newFeedItem];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        async (payload) => {
          console.log("📬 Real-time chat received:", payload);
          const newChat = payload.new as DbChat;
          const username = await getUserAlias(newChat.user_id);

          const newFeedItem: FeedItem = {
            id: newChat.id,
            type: "chat",
            content: newChat.content,
            username,
            timestamp: new Date(newChat.created_at),
            user_id: newChat.user_id,
          };

          setFeedItems((prev) => {
            // Avoid duplicates
            if (prev.some(item => item.id === newFeedItem.id)) {
              return prev;
            }
            return [...prev, newFeedItem];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          console.log("🗑️ Post deleted:", payload);
          const deletedId = payload.old.id;
          setFeedItems((prev) => prev.filter((item) => item.id !== deletedId));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chats" },
        (payload) => {
          console.log("🗑️ Chat deleted:", payload);
          const deletedId = payload.old.id;
          setFeedItems((prev) => prev.filter((item) => item.id !== deletedId));
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime subscription status:", status);
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log("🔌 Unsubscribing from realtime");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // ✅ Check remaining posts for current user
  useEffect(() => {
    const checkRemainingPosts = async () => {
      if (!currentUserId) return;

      const { data, error } = await supabase.rpc("get_remaining_posts", {
        p_user_id: currentUserId,
      });

      if (!error && data !== null) {
        setRemainingPosts(data);
      }
    };

    checkRemainingPosts();
    // Check every minute
    const interval = setInterval(checkRemainingPosts, 60000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // ✅ Check chat lock status and countdown
  useEffect(() => {
    const checkChatLock = async () => {
      const { data, error } = await supabase.rpc("is_chat_locked");

      if (!error) {
        setIsChatLocked(data);

        if (data) {
          // Get the latest post's lockout time
          const { data: postsData } = await supabase
            .from("posts")
            .select("chat_lockout_until")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (postsData?.chat_lockout_until) {
            const lockoutTime = new Date(postsData.chat_lockout_until).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((lockoutTime - now) / 1000));
            setChatLockTimeRemaining(remaining);
          }
        } else {
          setChatLockTimeRemaining(0);
        }
      }
    };

    checkChatLock();
    // Check every second for accurate countdown
    const interval = setInterval(checkChatLock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Scroll to bottom whenever feedItems changes
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedItems]);

  const sendChat = async () => {
    if (!message.trim() || !currentUserId) return;

    // Check if chat is locked - UI already shows warning, just prevent action
    if (isChatLocked) {
      return;
    }

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately

    // Optimistic update - add to UI immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticChat: FeedItem = {
      id: tempId,
      type: "chat",
      content: messageContent,
      username: alias,
      timestamp: new Date(),
      user_id: currentUserId,
    };

    setFeedItems((prev) => [...prev, optimisticChat]);

    try {
      const { data, error } = await supabase.from("chats").insert({
        user_id: currentUserId,
        content: messageContent,
      }).select();

      if (error) {
        console.error("Error sending chat:", error);
        // Remove optimistic update on error
        setFeedItems((prev) => prev.filter((item) => item.id !== tempId));
        setMessage(messageContent); // Restore message
        return;
      }

      // Replace temp item with real one from database
      if (data && data[0]) {
        setFeedItems((prev) => 
          prev.map((item) => 
            item.id === tempId 
              ? { ...item, id: data[0].id, timestamp: new Date(data[0].created_at) }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error sending chat:", error);
      setFeedItems((prev) => prev.filter((item) => item.id !== tempId));
      setMessage(messageContent);
    }
  };

  const makePost = async () => {
    if (!message.trim() || !currentUserId) return;

    // Check if user has remaining posts - UI already shows count, just prevent action
    if (remainingPosts <= 0) {
      return;
    }

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately

    // Optimistic update - add to UI immediately
    const tempId = `temp-post-${Date.now()}`;
    const optimisticPost: FeedItem = {
      id: tempId,
      type: "post",
      content: messageContent,
      username: alias,
      timestamp: new Date(),
      user_id: currentUserId,
    };

    setFeedItems((prev) => [...prev, optimisticPost]);

    try {
      const { data, error } = await supabase.from("posts").insert({
        user_id: currentUserId,
        content: messageContent,
      }).select();

      if (error) {
        console.error("Error creating post:", error);
        // Remove optimistic update on error
        setFeedItems((prev) => prev.filter((item) => item.id !== tempId));
        setMessage(messageContent); // Restore message
        return;
      }

      // Replace temp item with real one from database
      if (data && data[0]) {
        setFeedItems((prev) => 
          prev.map((item) => 
            item.id === tempId 
              ? { ...item, id: data[0].id, timestamp: new Date(data[0].created_at) }
              : item
          )
        );
      }
      
      // Refresh remaining posts count
      const { data: postsData } = await supabase.rpc("get_remaining_posts", {
        p_user_id: currentUserId,
      });
      if (postsData !== null) {
        setRemainingPosts(postsData);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setFeedItems((prev) => prev.filter((item) => item.id !== tempId));
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono text-green-400">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-green-700 p-4 flex justify-between items-center shadow-lg shadow-green-900/20 z-20">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-bold"
            style={{ textShadow: "0 0 5px #00ff00", letterSpacing: "0.05em" }}
          >
            XSEVEN – {alias}
          </h1>
          {isAdmin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-500 text-red-400 text-xs">
              <Shield className="h-3 w-3" />
              <span>ADMIN</span>
            </div>
          )}
          {/* Notification badge */}
          {unreadCount > 0 && (
            <div className="relative">
              <Bell className="h-5 w-5 text-green-400" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-green-500">
          FEED RESET IN{" "}
          <span className="text-green-300 font-extrabold">{timeUntilReset}</span>
        </p>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-48">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-green-500 animate-pulse">
              LOADING FEED DATA...
            </p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-green-700">
              SYSTEM LOG: Feed has been wiped. Awaiting input.
            </p>
          </div>
        ) : (
          feedItems.map((item) => (
            <FeedItemWithReplies
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              currentUserAlias={alias}
            />
          ))
        )}
        {/* ✅ This empty div is used for auto-scroll */}
        <div ref={feedEndRef} />
      </div>

      {/* Bottom Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-black border-t border-green-700 p-4 z-20">
        <div className="flex gap-2">
          <ThemedInput
            type="text"
            placeholder="Type command or message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <ThemedButton
            onClick={sendChat}
            isAccent
            className="w-12 h-12 p-0 flex items-center justify-center rounded-lg"
            disabled={!message.trim() || isChatLocked}
          >
            <Send className="h-5 w-5 text-black" />
          </ThemedButton>

          <ThemedButton
            onClick={makePost}
            className="w-12 h-12 p-0 flex items-center justify-center rounded-lg text-green-400"
            disabled={!message.trim() || remainingPosts <= 0}
          >
            <Plus className="h-5 w-5" />
          </ThemedButton>
        </div>
        
        {/* Status indicators */}
        <div className="mt-2 space-y-1">
          {isChatLocked ? (
            <p className="text-xs text-red-400 text-center font-mono animate-pulse border border-red-500/30 bg-red-900/20 py-1 px-2 rounded">
              ⚠️ CHAT LOCKED: {Math.floor(chatLockTimeRemaining / 60)}m {chatLockTimeRemaining % 60}s remaining
            </p>
          ) : remainingPosts <= 0 ? (
            <p className="text-xs text-yellow-400 text-center font-mono border border-yellow-500/30 bg-yellow-900/20 py-1 px-2 rounded">
              ⚠️ POST LIMIT REACHED: Resets at midnight UTC
            </p>
          ) : null}
          <p className="text-xs text-green-700 text-center">
            <span className={isChatLocked ? "text-red-500" : "text-green-400"}>
              SEND
            </span> for CHAT •
            <span className={remainingPosts <= 0 ? "text-yellow-500" : "text-green-400"}>
              PLUS
            </span> for POST
            <span className="text-green-500 font-bold ml-2">
              ({remainingPosts}/3 posts left)
            </span>
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FeedScreen;
