import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const StartScreen = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleEnter = () => {
    const finalUsername = username.trim() || "Anonymousx7";
    localStorage.setItem("xseven-username", finalUsername);
    navigate("/feed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEnter();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* App Name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Xseven
          </h1>
        </div>

        {/* Username Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Username (optional)
            </label>
            <Input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for "Anonymousx7"
            </p>
          </div>

          {/* Enter Button */}
          <Button 
            onClick={handleEnter}
            className="w-full bg-primary text-primary-foreground hover:bg-accent font-medium"
          >
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;