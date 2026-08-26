import React, { useState } from 'react';
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const LockIcon = () => (
  <svg 
    className="w-8 h-8 text-green-400 mb-6 animate-pulse" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ textShadow: '0 0 5px #00ff00' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3"/>
  </svg>
);

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setMessage('ERROR: Fields cannot be blank.');
      return;
    }

    setLoading(true);

    try {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('SUCCESS: Account created! Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setMessage('ACCESS GRANTED: Login successful!');
        // 👇 Redirect after login
        setTimeout(() => {
          navigate("/pick-username");
        }, 1000);
      }
    } catch (err: any) {
      setMessage(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formTitle = isSigningUp ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN';
  const buttonText = isSigningUp ? 'INITIATE REGISTRY' : 'EXECUTE ACCESS';
  const toggleText = isSigningUp ? 'Already connected?' : 'Need registry?';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black font-mono p-8">
      <LockIcon />
      <h2 
        className="text-2xl sm:text-3xl font-bold mb-8 text-green-400"
        style={{ textShadow: '0 0 7px #00ff00', letterSpacing: '0.1em' }}
      >
        {formTitle}
      </h2>
      
      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-6">
        <input
          type="email"
          placeholder="ENTER EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 bg-black/50 border border-green-700 text-green-400 placeholder-green-800 
                     focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none rounded-none transition duration-150"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="ENTER PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 bg-black/50 border border-green-700 text-green-400 placeholder-green-800 
                     focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none rounded-none transition duration-150"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-green-400 text-black font-extrabold text-lg 
                     rounded-lg hover:bg-green-500 transition duration-200 uppercase
                     shadow-[0_0_15px_rgba(0,255,0,0.5)] active:shadow-none disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? 'PROCESSING...' : buttonText}
        </button>
      </form>

      {message && (
        <p className={`mt-6 text-sm ${message.includes('ERROR') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      <button
        onClick={() => setIsSigningUp(!isSigningUp)}
        className="mt-8 text-sm text-green-700 hover:text-green-400 transition duration-150"
        disabled={loading}
      >
        {toggleText} 
        <span className="font-semibold underline ml-1 text-green-400">
          {isSigningUp ? 'LOG IN' : 'SIGN UP'}
        </span>
      </button>
    </div>
  );
};

export default Auth;
