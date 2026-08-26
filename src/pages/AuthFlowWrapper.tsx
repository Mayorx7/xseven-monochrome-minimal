import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Import screens
import SplashScreen from "./SplashScreen";
import WelcomeScreen from "./WelcomeScreen";
import Auth from "./Auth";
import PickUsernameScreen from "./PickUsernameScreen";

type FlowStage = "splash" | "welcome" | "auth" | "pickUsername" | "done";

const AuthFlowWrapper = () => {
  const [flowStage, setFlowStage] = useState<FlowStage>("splash");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const navigateToFeed = useCallback(() => {
    setFlowStage("done");
    navigate("/feed", { replace: true });
  }, [navigate]);

  // --- 1. Supabase Check & Listener ---
  useEffect(() => {
    let subscription: any = null;

    const checkSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      setSession(initialSession);
      setLoading(false);

      if (initialSession) {
        // If logged in, check profile for username
        checkProfile(initialSession.user.id);
      } else {
        // Not logged in → proceed with splash/welcome/auth
        setFlowStage("splash");
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
          if (newSession) {
            checkProfile(newSession.user.id);
          } else {
            setFlowStage("auth");
          }
        }
      );
      subscription = sub;
    };

    const checkProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        return;
      }

      if (data?.username) {
        navigateToFeed();
      } else {
        setFlowStage("pickUsername");
      }
    };

    checkSession();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigateToFeed]);

  // --- 2. Splash Timer ---
  useEffect(() => {
    if (!loading && flowStage === "splash" && !session) {
      const timer = setTimeout(() => {
        setFlowStage("welcome");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, flowStage, session]);

  // --- 3. Render Logic ---
  if (loading) {
    return (
      <SplashScreen
        onFinish={() => {
          // Loading screen only, no action needed
        }}
      />
    );
  }

  if (flowStage === "splash") {
    return (
      <SplashScreen
        onFinish={() => {
          if (!session) setFlowStage("welcome");
        }}
      />
    );
  }

  if (flowStage === "welcome") {
    return <WelcomeScreen onContinue={() => setFlowStage("auth")} />;
  }

  if (flowStage === "auth" && !session) {
    return <Auth />;
  }

  if (flowStage === "pickUsername" && session) {
    return (
      <PickUsernameScreen
        onDone={() => {
          navigateToFeed();
        }}
      />
    );
  }

 if (flowStage === "done") {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      Entering the Network...
    </div>
  );
}

  return <div>Error loading application.</div>;
};

export default AuthFlowWrapper;
