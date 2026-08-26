-- ============================================
-- XSEVEN Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Track when this post was created for chat lockout
  chat_lockout_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 minutes')
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_until TIMESTAMPTZ,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX chats_user_id_idx ON chats(user_id);
CREATE INDEX chats_created_at_idx ON chats(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chats table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Posts policies
-- Anyone authenticated can read all posts
CREATE POLICY "Anyone can view posts" 
  ON posts FOR SELECT 
  TO authenticated 
  USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can create their own posts" 
  ON posts FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" 
  ON posts FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" 
  ON posts FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Chats policies
-- Anyone authenticated can read all chats
CREATE POLICY "Anyone can view chats" 
  ON chats FOR SELECT 
  TO authenticated 
  USING (true);

-- Users can insert their own chats
CREATE POLICY "Users can create their own chats" 
  ON chats FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chats
CREATE POLICY "Users can delete their own chats" 
  ON chats FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ============================================
-- Functions for feed management
-- ============================================

-- Function to delete posts/chats older than 24 hours
CREATE OR REPLACE FUNCTION delete_old_feed_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete posts older than 24 hours
  DELETE FROM posts 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete chats older than 24 hours
  DELETE FROM chats 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Function to check if user can post (max 3 posts per day)
CREATE OR REPLACE FUNCTION can_user_post(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_count INTEGER;
BEGIN
  -- Count posts created today (since midnight UTC)
  SELECT COUNT(*) INTO post_count
  FROM posts
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('day', NOW());
  
  -- Return true if less than 3 posts today
  RETURN post_count < 3;
END;
$$;

-- Function to check if chat is currently locked (3 min after any post)
CREATE OR REPLACE FUNCTION is_chat_locked()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_lockout TIMESTAMPTZ;
BEGIN
  -- Get the most recent chat_lockout_until time
  SELECT MAX(chat_lockout_until) INTO latest_lockout
  FROM posts;
  
  -- If no posts exist, chat is not locked
  IF latest_lockout IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Return true if current time is before the lockout expiry
  RETURN NOW() < latest_lockout;
END;
$$;

-- Function to get remaining posts for a user today
CREATE OR REPLACE FUNCTION get_remaining_posts(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO post_count
  FROM posts
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('day', NOW());
  
  RETURN 3 - post_count;
END;
$$;

-- ============================================
-- Admin Functions
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Function to ban a user
CREATE OR REPLACE FUNCTION ban_user(
  p_admin_id UUID,
  p_user_id UUID,
  p_duration_hours INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can ban users';
  END IF;
  
  -- Ban the user
  UPDATE profiles
  SET 
    is_banned = TRUE,
    banned_until = NOW() + (p_duration_hours || ' hours')::INTERVAL,
    ban_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to unban a user
CREATE OR REPLACE FUNCTION unban_user(
  p_admin_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can unban users';
  END IF;
  
  -- Unban the user
  UPDATE profiles
  SET 
    is_banned = FALSE,
    banned_until = NULL,
    ban_reason = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_posts', (SELECT COUNT(*) FROM posts),
    'total_chats', (SELECT COUNT(*) FROM chats),
    'posts_today', (SELECT COUNT(*) FROM posts WHERE created_at >= DATE_TRUNC('day', NOW())),
    'chats_today', (SELECT COUNT(*) FROM chats WHERE created_at >= DATE_TRUNC('day', NOW())),
    'active_users_today', (
      SELECT COUNT(DISTINCT user_id) 
      FROM (
        SELECT user_id FROM posts WHERE created_at >= DATE_TRUNC('day', NOW())
        UNION
        SELECT user_id FROM chats WHERE created_at >= DATE_TRUNC('day', NOW())
      ) AS active
    ),
    'banned_users', (SELECT COUNT(*) FROM profiles WHERE is_banned = TRUE)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ============================================
-- Instructions:
-- ============================================
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase Dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Optionally, set up a cron job to run delete_old_feed_items() daily
--    (Go to Database > Cron Jobs in Supabase Dashboard)
-- ============================================
