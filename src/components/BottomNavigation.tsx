import { useLocation, useNavigate } from "react-router-dom";
import { Home, User } from "lucide-react";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-700">
      <div className="flex">
        <button
          onClick={() => navigate("/feed")}
          className={`flex-1 flex flex-col items-center py-3 transition-colors ${
            isActive("/feed") 
              ? "text-green-400" 
              : "text-green-700 hover:text-green-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1 font-mono">FEED</span>
        </button>
        
        <button
          onClick={() => navigate("/profile")}
          className={`flex-1 flex flex-col items-center py-3 transition-colors ${
            isActive("/profile") 
              ? "text-green-400" 
              : "text-green-700 hover:text-green-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1 font-mono">PROFILE</span>
        </button>
      </div>
    </div>
  );
};