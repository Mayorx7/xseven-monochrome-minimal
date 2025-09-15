import { useLocation, useNavigate } from "react-router-dom";
import { Home, User } from "lucide-react";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-nav-bg border-t border-nav-border">
      <div className="flex">
        <button
          onClick={() => navigate("/feed")}
          className={`flex-1 flex flex-col items-center py-3 transition-colors ${
            isActive("/feed") 
              ? "text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Feed</span>
        </button>
        
        <button
          onClick={() => navigate("/profile")}
          className={`flex-1 flex flex-col items-center py-3 transition-colors ${
            isActive("/profile") 
              ? "text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};