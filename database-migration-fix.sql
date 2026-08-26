-- ============================================
-- XSEVEN Database Migration - Bug Fixes
-- ============================================
-- Run this in your Supabase SQL Editor to fix:
-- 1. Allow multiple users to use "Anonymousx7"
-- 2. Ensure 24-hour auto-deletion works
-- ============================================

-- Fix 1: Remove UNIQUE constraint from alias column
-- This allows multiple users to use "Anonymousx7"
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_alias_key;

-- Fix 2: Verify and recreate the delete_old_feed_items function
-- This ensures posts/chats older than 24 hours are deleted
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
  
  -- Log the deletion (optional, for debugging)
  RAISE NOTICE 'Deleted old feed items at %', NOW();
END;
$$;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if the function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'delete_old_feed_items';

-- Check current constraints on profiles table
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- ============================================
-- Manual Test (Optional)
-- ============================================

-- Test the deletion function manually:
-- SELECT delete_old_feed_items();

-- Check how many posts/chats are older than 24 hours:
-- SELECT 
--   (SELECT COUNT(*) FROM posts WHERE created_at < NOW() - INTERVAL '24 hours') as old_posts,
--   (SELECT COUNT(*) FROM chats WHERE created_at < NOW() - INTERVAL '24 hours') as old_chats;

-- ============================================
-- Set Up Cron Job (If Not Already Done)
-- ============================================
-- Go to Supabase Dashboard → Database → Cron Jobs
-- Create a new cron job:
--   Name: delete_old_feed_items
--   Schedule: 0 * * * * (every hour)
--   SQL: SELECT delete_old_feed_items();
-- ============================================
