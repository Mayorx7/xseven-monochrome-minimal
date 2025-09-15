import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

const ProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedUsername = localStorage.getItem("xseven-username") || "Anonymousx7";
    setUsername(savedUsername);
    setNewUsername(savedUsername);
  }, []);

  const updateUsername = () => {
    const finalUsername = newUsername.trim() || "Anonymousx7";
    localStorage.setItem("xseven-username", finalUsername);
    setUsername(finalUsername);
    
    toast({
      title: "Username updated",
      description: `Your username is now ${finalUsername}`,
    });
  };

  const resetToAnonymous = () => {
    localStorage.setItem("xseven-username", "Anonymousx7");
    setUsername("Anonymousx7");
    setNewUsername("Anonymousx7");
    
    toast({
      title: "Username reset",
      description: "Your username has been reset to Anonymousx7",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateUsername();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-background border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-6 pb-32">
        <div className="max-w-sm mx-auto space-y-6">
          
          {/* Current Username */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-muted border-2 border-border rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{username}</h2>
          </div>

          {/* Edit Username */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Edit Username
              </label>
              <Input
                type="text"
                placeholder="Enter new username..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button 
              onClick={updateUsername}
              className="w-full bg-primary text-primary-foreground hover:bg-accent font-medium"
            >
              Update Username
            </Button>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={resetToAnonymous}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
            >
              Reset to Anonymousx7
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>Username changes apply to future posts and chats.</p>
            <p className="mt-1">The feed resets daily at midnight UTC.</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfileScreen;