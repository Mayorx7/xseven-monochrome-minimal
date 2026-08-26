import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Clock, MessageSquare, AlertTriangle, Zap } from "lucide-react";

const AboutScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
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
          XSEVEN – SYSTEM INFO
        </h1>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4 space-y-6 max-w-3xl mx-auto">
        {/* Welcome Section */}
        <div className="border-2 border-green-700 bg-green-900/10 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <Zap className="mr-2 h-6 w-6" />
            WELCOME TO XSEVEN
          </h2>
          <p className="text-green-300 leading-relaxed">
            XSEVEN is an encrypted social network where all transmissions are temporary. 
            The feed resets every 24 hours. Your identity is protected by your alias. 
            All communications are monitored by the XSEVEN_CORE system.
          </p>
        </div>

        {/* Rules Section */}
        <div className="border-2 border-red-700 bg-red-900/10 p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            SYSTEM RULES
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-bold text-red-300 mb-2">
                1. POST LIMIT: 3 PER DAY
              </h3>
              <p className="text-green-300 text-sm">
                Each user can create a maximum of <span className="text-red-400 font-bold">3 POSTS</span> per day.
                Posts are high-priority system alerts visible to all users.
                Your post counter resets at <span className="text-red-400 font-bold">midnight UTC</span>.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">
                2. CHAT LOCKOUT: 3 MINUTES
              </h3>
              <p className="text-green-300 text-sm">
                When <span className="text-yellow-400 font-bold">ANY USER</span> creates a post, 
                <span className="text-yellow-400 font-bold"> ALL USERS</span> are locked from chatting for{" "}
                <span className="text-yellow-400 font-bold">3 MINUTES</span>.
                This ensures posts get proper attention before the chat resumes.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-bold text-blue-300 mb-2">
                3. FEED RESET: 24 HOURS
              </h3>
              <p className="text-green-300 text-sm">
                All posts and chats are automatically deleted after{" "}
                <span className="text-blue-400 font-bold">24 HOURS</span>.
                Nothing is permanent. The feed is wiped clean daily.
                Plan your transmissions accordingly.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="border-2 border-green-700 bg-green-900/10 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6" />
            HOW TO USE
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-green-300 mb-2">
                📤 SENDING CHATS
              </h3>
              <ul className="text-green-300 text-sm space-y-1 list-disc list-inside">
                <li>Type your message in the input field</li>
                <li>Press <span className="text-green-400 font-bold">ENTER</span> or click the{" "}
                  <span className="text-green-400 font-bold">SEND</span> button</li>
                <li>Your chat appears on the right side with a double-ring border</li>
                <li>Other users' chats appear on the left with a green highlight</li>
                <li>Chats are instant and casual communication</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-green-300 mb-2">
                📢 CREATING POSTS
              </h3>
              <ul className="text-green-300 text-sm space-y-1 list-disc list-inside">
                <li>Type your message in the input field</li>
                <li>Click the <span className="text-red-400 font-bold">PLUS (+)</span> button</li>
                <li>Posts appear as red alert boxes for all users</li>
                <li>Posts trigger a 3-minute chat lockout for everyone</li>
                <li>Use posts for important announcements only</li>
                <li>You have <span className="text-red-400 font-bold">3 posts per day</span> - use them wisely</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-2 border-green-700 bg-green-900/10 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/50 border border-green-700/50 p-4">
              <h3 className="text-green-400 font-bold mb-2">🔒 ANONYMOUS</h3>
              <p className="text-green-300 text-sm">
                Your identity is protected by your chosen alias. No real names required.
              </p>
            </div>

            <div className="bg-black/50 border border-green-700/50 p-4">
              <h3 className="text-green-400 font-bold mb-2">⚡ REAL-TIME</h3>
              <p className="text-green-300 text-sm">
                Messages appear instantly. No refresh needed. Live communication.
              </p>
            </div>

            <div className="bg-black/50 border border-green-700/50 p-4">
              <h3 className="text-green-400 font-bold mb-2">🕐 TEMPORARY</h3>
              <p className="text-green-300 text-sm">
                Everything disappears after 24 hours. No permanent records.
              </p>
            </div>

            <div className="bg-black/50 border border-green-700/50 p-4">
              <h3 className="text-green-400 font-bold mb-2">🎯 FOCUSED</h3>
              <p className="text-green-300 text-sm">
                Post limits ensure quality over quantity. Every post matters.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border-2 border-green-700 bg-green-900/10 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <Clock className="mr-2 h-6 w-6" />
            PRO TIPS
          </h2>
          <ul className="text-green-300 text-sm space-y-2 list-disc list-inside">
            <li>Save your important posts for peak hours when more users are online</li>
            <li>Use chats for casual conversation, posts for important announcements</li>
            <li>Check the countdown timer before posting to avoid wasting a post</li>
            <li>Your post counter shows remaining posts: <span className="text-green-400 font-bold">(X/3 posts left)</span></li>
            <li>When chat is locked, you'll see a red warning with countdown</li>
            <li>The feed reset timer shows time until everything is wiped</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="border-2 border-green-700 bg-green-900/10 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            NEED HELP?
          </h2>
          <p className="text-green-300 text-sm mb-4">
            If you encounter any issues or have questions about XSEVEN, 
            check the feed for system announcements from{" "}
            <span className="text-red-400 font-bold">XSEVEN_CORE</span>.
          </p>
          <div className="bg-black/50 border border-green-700/50 p-4">
            <p className="text-green-500 text-xs font-mono">
              SYSTEM STATUS: <span className="text-green-400">OPERATIONAL</span><br />
              ENCRYPTION: <span className="text-green-400">ACTIVE</span><br />
              FEED MONITORING: <span className="text-green-400">ENABLED</span><br />
              VERSION: <span className="text-green-400">1.0.0</span>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-2 border-green-700 bg-green-900/10 p-4">
          <h2 className="text-lg font-bold text-green-400 mb-3">QUICK LINKS</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/settings")}
              className="w-full p-3 bg-black/50 border border-green-700 text-green-400 hover:bg-green-900/30 hover:border-green-500 transition text-left"
            >
              → Go to Settings
            </button>
            <button
              onClick={() => navigate("/feed")}
              className="w-full p-3 bg-black/50 border border-green-700 text-green-400 hover:bg-green-900/30 hover:border-green-500 transition text-left"
            >
              → Back to Feed
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-green-700">
          <p className="text-green-700 text-xs">
            XSEVEN © 2025 • ALL TRANSMISSIONS ENCRYPTED • FEED RESETS DAILY
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
