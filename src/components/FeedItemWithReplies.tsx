import React, { useState, useEffect } from "react";
import { MessageCircle, CornerUpRight, X, Send } from "lucide-react";
import { supabase } from "../supabaseClient";

interface Reply {
  id: string;
  user_id: string;
  content: string;
  username: string;
  created_at: string;
}

interface FeedItemProps {
  item: {
    id: string;
    type: "post" | "chat";
    content: string;
    username: string;
    timestamp: Date;
    user_id?: string;
  };
  currentUserId: string | null;
  currentUserAlias: string;
}

export const FeedItemWithReplies: React.FC<FeedItemProps> = ({ item, currentUserId, currentUserAlias }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const isCurrentUser = item.user_id === currentUserId;

  // Load replies when expanded
  useEffect(() => {
    if (showReplies) {
      loadReplies();
    }
  }, [showReplies]);

  // Load reply count on mount
  useEffect(() => {
    loadReplyCount();
  }, [item.id]);

  const loadReplyCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_reply_count', {
        p_parent_id: item.id,
        p_parent_type: item.type
      });

      if (!error && data !== null) {
        setReplyCount(data);
      }
    } catch (error) {
      console.error('Error loading reply count:', error);
    }
  };

  const loadReplies = async () => {
    setIsLoadingReplies(true);
    try {
      const { data, error } = await supabase.rpc('get_replies', {
        p_parent_id: item.id,
        p_parent_type: item.type
      });

      if (!error && data) {
        setReplies(data);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !currentUserId) return;

    const content = replyText.trim();
    setReplyText("");

    try {
      const { data, error } = await supabase
        .from('replies')
        .insert({
          user_id: currentUserId,
          parent_id: item.id,
          parent_type: item.type,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending reply:', error);
        setReplyText(content);
        return;
      }

      // Add reply to local state
      if (data) {
        const newReply: Reply = {
          id: data.id,
          user_id: data.user_id,
          content: data.content,
          username: currentUserAlias,
          created_at: data.created_at
        };
        setReplies([...replies, newReply]);
        setReplyCount(replyCount + 1);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyText(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  // Render Post
  if (item.type === "post") {
    return (
      <div className="border border-red-500 bg-red-900/10 p-4 rounded-lg shadow-[0_0_10px_rgba(255,0,0,0.3)] border-l-4 mb-3">
        <div className="flex items-center mb-2">
          <CornerUpRight className="w-4 h-4 text-red-400 mr-2 transform rotate-90" />
          <p className="text-red-400 text-xs font-bold uppercase">
            // SYSTEM ALERT: {item.username} ({item.timestamp.toLocaleTimeString()})
          </p>
        </div>
        <p className="text-white font-mono text-sm leading-snug mb-3">{item.content}</p>
        
        {/* Reply button */}
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-2 text-xs text-red-300 hover:text-red-100 transition-colors"
        >
          <MessageCircle className="w-3 h-3" />
          <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
        </button>

        {/* Replies section */}
        {showReplies && (
          <div className="mt-3 pl-4 border-l-2 border-red-500/30">
            {isLoadingReplies ? (
              <p className="text-xs text-red-400 animate-pulse">Loading replies...</p>
            ) : replies.length === 0 ? (
              <p className="text-xs text-red-400/50">No replies yet</p>
            ) : (
              <div className="space-y-2 mb-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-black/30 p-2 rounded border border-red-500/20">
                    <p className="text-xs text-red-300 font-semibold mb-1">{reply.username}</p>
                    <p className="text-xs text-white">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {currentUserId && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type reply..."
                  className="flex-1 p-2 text-xs bg-black/50 border border-red-700 text-red-400 placeholder-red-800 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none font-mono"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="p-2 bg-red-900/30 border border-red-500 text-red-400 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render Chat
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
        {isCurrentUser ? (
          // Your messages - double square ring style
          <div className="relative">
            <div className="absolute inset-0 border-2 border-green-700/40" style={{ transform: 'translate(-4px, -4px)' }}></div>
            <div className="relative p-3 border-2 bg-black/80 border-green-700/60">
              <p className="text-xs font-semibold mb-1 tracking-wider font-mono text-green-500/90">
                {item.username}
              </p>
              <p className="text-sm font-mono leading-relaxed text-green-400/90 mb-2">
                {item.content}
              </p>
              
              {/* Reply button */}
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-green-300/70 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{replyCount}</span>
              </button>
            </div>
          </div>
        ) : (
          // Other users' messages
          <div className="bg-gray-900/70 border-l-4 border-green-500 p-3 pl-4">
            <p className="text-green-500 text-xs font-semibold mb-1 tracking-wider">
              {item.username}
            </p>
            <p className="text-green-300 text-sm mb-2">
              {item.content}
            </p>
            
            {/* Reply button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs text-green-300/70 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{replyCount}</span>
            </button>
          </div>
        )}

        {/* Replies section */}
        {showReplies && (
          <div className="mt-2 pl-4 border-l-2 border-green-500/30">
            {isLoadingReplies ? (
              <p className="text-xs text-green-400 animate-pulse">Loading replies...</p>
            ) : replies.length === 0 ? (
              <p className="text-xs text-green-400/50">No replies yet</p>
            ) : (
              <div className="space-y-2 mb-2">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-black/30 p-2 rounded border border-green-500/20">
                    <p className="text-xs text-green-400 font-semibold mb-1">{reply.username}</p>
                    <p className="text-xs text-green-300">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {currentUserId && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type reply..."
                  className="flex-1 p-2 text-xs bg-black/50 border border-green-700 text-green-400 placeholder-green-800 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none font-mono"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="p-2 bg-green-900/30 border border-green-500 text-green-400 hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
