import React, { useState, useEffect } from "react";
import { User, Lock, LogOut } from "lucide-react"; // Added LogOut icon for clarity
import { supabase } from "./supabaseClient"; // Correct path from src/
import { useNavigate } from "react-router-dom"; // --- NEW: Import useNavigate ---

// --- SHARED TYPE DEFINITIONS ---
interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isAccent?: boolean;
}

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // Add any specific props if needed
}

interface ProfileScreenProps {
    currentUser: any; // Supabase User object
    // REMOVED: setCurrentPage: (page: string) => void;
    setCurrentUser: (user: any | null) => void; // For logging out
}

// --- SHARED THEMED UI PLACEHOLDERS ---

// Themed Button
const ThemedButton: React.FC<ThemedButtonProps> = ({ children, className, isAccent = false, ...props }) => (
    <button
        className={`p-3 rounded-lg font-semibold uppercase transition duration-200 
                    flex items-center justify-center text-sm
                    ${isAccent 
                        ? 'bg-green-400 text-black shadow-[0_0_10px_rgba(0,255,0,0.5)] hover:bg-green-500' 
                        : 'bg-black text-green-400 border border-green-700 hover:border-green-400'
                    } ${className}`}
        {...props}
    >
        {children}
    </button>
);

// Themed Input
const ThemedInput: React.FC<ThemedInputProps> = ({ className, ...props }) => (
    <input
        className={`w-full p-3 bg-black/50 border border-green-700 text-green-400 placeholder-green-800 
                    focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none rounded-none font-mono transition duration-150 
                    ${className}`}
        {...props}
    />
);

// Themed Bottom Navigation
const ThemedBottomNavigation: React.FC<{ currentPage: string }> = ({ currentPage }) => {
    
    const navigate = useNavigate(); // --- NEW: Use useNavigate hook ---
    
    const navItemClass = (page: string) => `p-2 hover:text-green-300 transition duration-150 cursor-pointer ${currentPage === page ? 'text-green-400 border-b-2 border-green-400' : 'text-green-700'}`;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-green-700 flex justify-around items-center text-green-400 font-mono text-sm shadow-[0_0_10px_rgba(0,255,0,0.5)] z-10">
            {/* Navigates to /feed */}
            <div className={navItemClass('FEED')} onClick={() => navigate('/feed')}>
                NETWORK
            </div>
            {/* Navigates to /profile */}
            <div className={navItemClass('PROFILE')} onClick={() => navigate('/profile')}>
                PROFILE
            </div>
        </div>
    );
};


// --- MAIN PROFILE COMPONENT ---

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, setCurrentUser }) => {
    // We still need the navigate hook inside the main component to handle the LOGOUT redirect
    const navigate = useNavigate();
    
    const [alias, setAlias] = useState("LOADING...");
    const [newAlias, setNewAlias] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Function to display a message, simulating toast/notifications
    const showMessage = (msg: string, isError = false) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000); 
    };

    // --- DATA FETCHING ---
    useEffect(() => {
        if (currentUser) {
            fetchProfile();
        } else {
            // Should not happen if auth flow is correct, but safe fallback
            setAlias("ANONYMOUS-SESSION");
        }
    }, [currentUser]);

    const fetchProfile = async () => {
        if (!currentUser) return;
        
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('alias')
            .eq('id', currentUser.id)
            .single();
        
        setIsLoading(false);

        if (error) {
            console.error('Error fetching profile:', error);
            // This is likely a missing profile row, use default
            setAlias(currentUser.email || "ERROR-FETCH");
            setNewAlias(currentUser.email || "");
            showMessage("PROFILE FETCH FAILED. CHECK DB TRIGGER.", true);
        } else if (data) {
            setAlias(data.alias);
            setNewAlias(data.alias);
        }
    };


    // --- DATA UPDATING ---
    const updateAlias = async () => {
        if (!currentUser || isLoading) return;
        
        const finalAlias = newAlias.trim();
        if (finalAlias === alias) {
             showMessage("HANDLE UNCHANGED.", false);
             return;
        }

        if (finalAlias.length < 3) {
             showMessage("HANDLE TOO SHORT. MINIMUM 3 CHARS.", true);
             return;
        }

        setIsLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({ alias: finalAlias, updated_at: new Date().toISOString() })
            .eq('id', currentUser.id);

        setIsLoading(false);

        if (error) {
            console.error('Error updating profile:', error);
            showMessage(`UPDATE FAILED: ${error.message}`, true);
        } else {
            setAlias(finalAlias);
            showMessage(`USERNAME CHANGE SUCCESS: New Handle is ${finalAlias}`, false);
        }
    };

    // --- SESSION MANAGEMENT ---
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            showMessage(`LOGOUT FAILED: ${error.message}`, true);
        } else {
            setCurrentUser(null); 
            // After successful logout, redirect the user to the public auth screen
            navigate('/auth');
        }
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            updateAlias();
        }
    };

    const displayAlias = alias.toUpperCase();
    const firstLetter = displayAlias.charAt(0);


    return (
        <div className="min-h-screen bg-black flex flex-col font-mono text-green-400">
            {/* Top Bar (Themed) */}
            <div className="bg-black border-b border-green-700 p-4 shadow-lg shadow-green-900/20">
                <h1 
                    className="text-xl font-bold"
                    style={{ textShadow: '0 0 5px #00ff00', letterSpacing: '0.05em' }}
                >
                    USER PROFILE
                </h1>
            </div>

            {/* Profile Content */}
            <div className="flex-1 p-6 pb-32 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-8">
                    
                    {/* Current Username Display */}
                    <div className="text-center space-y-4 pt-4">
                        {/* Avatar placeholder with hacker styling */}
                        <div className="w-24 h-24 bg-gray-900/50 border-2 border-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                             {isLoading ? (
                                <span className="text-2xl font-bold text-green-400 animate-pulse">...</span>
                            ) : (
                                <span className="text-3xl font-bold text-green-400">{firstLetter}</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-green-300">
                            {displayAlias}
                        </h2>
                        <p className="text-sm text-green-700">
                            ID: {currentUser?.id.substring(0, 8)}...
                        </p>
                    </div>

                    {/* Message/Toast Simulation */}
                    {message && (
                        <div className={`text-center p-3 text-sm rounded-lg border 
                            ${message.includes("FAILED") ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}
                        `}>
                            {message}
                        </div>
                    )}

                    {/* Edit Username Section */}
                    <div className="space-y-4 p-4 border border-green-900 rounded-lg bg-gray-900/20">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-green-400 block">
                                NEW IDENTITY: EDIT HANDLE
                            </label>
                            <ThemedInput
                                type="text"
                                placeholder="Enter new username..."
                                value={newAlias}
                                onChange={(e) => setNewAlias(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                        </div>

                        <ThemedButton 
                            onClick={updateAlias}
                            isAccent
                            className="w-full text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? 'PROCESSING...' : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    SECURE & UPDATE HANDLE
                                </>
                            )}
                        </ThemedButton>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 border-t border-green-800">
                        <ThemedButton 
                            onClick={handleLogout}
                            className="w-full border-red-700 text-red-500 hover:bg-red-900/20 hover:border-red-500 transition duration-200"
                        >
                             <LogOut className="h-4 w-4 mr-2" />
                            LOGOUT // TERMINATE SESSION
                        </ThemedButton>
                    </div>

                    {/* Info */}
                    <div className="text-center text-xs text-green-700 pt-4">
                        <p>WARNING: Username changes apply to future communications.</p>
                        <p className="mt-1">All session data is scrubbed at 00:00 UTC.</p>
                    </div>
                </div>
            </div>

            {/* ThemedBottomNavigation no longer requires setCurrentPage */}
            <ThemedBottomNavigation currentPage={'PROFILE'} />
        </div>
    );
};

export default ProfileScreen;
