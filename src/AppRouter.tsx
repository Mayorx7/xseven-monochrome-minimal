import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Pages
import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import Auth from "./pages/Auth";
import AuthFlowWrapper from "./pages/AuthFlowWrapper";
import PickUsernameScreen from "./pages/PickUsernameScreen";
import FeedScreen from "./pages/FeedScreen";
import ProfileScreen from "./pages/ProfileScreen";
import AboutScreen from "./pages/AboutScreen";
import SettingsScreen from "./pages/SettingsScreen";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import { supabase } from "./supabaseClient";

/* ----------- PROFILE ROUTE WRAPPER ----------- */
const ProfileRouteWrapper: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState("PROFILE"); // Added for navigation
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/auth", { replace: true });
      } else {
        setCurrentUser(data.user);
      }
    };
    loadUser();
  }, [navigate]);

  if (!currentUser) return null; // can show a spinner here instead of null

  return (
    <ProfileScreen
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      setCurrentPage={setCurrentPage}   // ✅ FIX: Added this prop
    />
  );
};

/* --------------- APP ROUTER ----------------- */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Default landing page is splash */}
      <Route path="/" element={<SplashScreen />} />

      {/* Navigated after splash timer */}
      <Route path="/welcome" element={<WelcomeScreen />} />

      {/* Auth flow */}
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/pick-username"
        element={<PickUsernameScreen onDone={() => {}} />}
      />

      {/* Main app pages */}
      <Route path="/feed" element={<FeedScreen />} />
      <Route path="/profile" element={<ProfileRouteWrapper />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;
