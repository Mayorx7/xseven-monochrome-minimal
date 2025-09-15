import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Post } from "@/components/Post";
import { Chat } from "@/components/Chat";
import { Send, Plus } from "lucide-react";

interface FeedItem {
  id: string;
  type: "post" | "chat";
  content: string;
  username: string;
  timestamp: Date;
  parentId?: string;
}

const FeedScreen = () => {
  const [message, setMessage] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    // Load feed from localStorage
    const savedFeed = localStorage.getItem("xseven-feed");
    if (savedFeed) {
      const parsedFeed = JSON.parse(savedFeed).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setFeedItems(parsedFeed);
    }

    // Update timer every minute
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);

    return () => clearInterval(timer);
  }, []);

  const saveFeed = (items: FeedItem[]) => {
    localStorage.setItem("xseven-feed", JSON.stringify(items));
  };

  const sendChat = () => {
    if (!message.trim()) return;

    const username = localStorage.getItem("xseven-username") || "Anonymousx7";
    const newChat: FeedItem = {
      id: Date.now().toString(),
      type: "chat",
      content: message.trim(),
      username,
      timestamp: new Date(),
    };

    const updatedFeed = [...feedItems, newChat];
    setFeedItems(updatedFeed);
    saveFeed(updatedFeed);
    setMessage("");
  };

  const makePost = () => {
    if (!message.trim()) return;

    const username = localStorage.getItem("xseven-username") || "Anonymousx7";
    const newPost: FeedItem = {
      id: Date.now().toString(),
      type: "post",
      content: message.trim(),
      username,
      timestamp: new Date(),
    };

    const updatedFeed = [...feedItems, newPost];
    setFeedItems(updatedFeed);
    saveFeed(updatedFeed);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-background border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-foreground">Xseven</h1>
        <p className="text-sm text-muted-foreground">
          Feed resets in {timeUntilReset}
        </p>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {feedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              The feed has been reset. Start fresh!
            </p>
          </div>
        ) : (
          feedItems.map((item) => (
            item.type === "post" ? (
              <Post key={item.id} item={item} />
            ) : (
              <Chat key={item.id} item={item} />
            )
          ))
        )}
      </div>

      {/* Bottom Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            onClick={sendChat} 
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-accent"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            onClick={makePost} 
            size="icon"
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Send = Chat • Plus = Post
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FeedScreen;