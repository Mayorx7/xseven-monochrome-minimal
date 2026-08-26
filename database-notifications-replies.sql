-- ============================================
-- XSEVEN Database Migration - Notifications & Replies
-- ============================================
-- Run this in your Supabase SQL Editor to add:
-- 1. Reply functionality for posts and chats
-- 2. Push notification support
-- ============================================

-- Create replies table (supports replying to both posts and chats)
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL, -- ID of the post or chat being replied to
  parent_type TEXT NOT NULL CHECK (parent_type IN ('post', 'chat')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_tokens table for push notifications
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table to track notification history
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_message', 'new_reply', 'new_post', 'mention')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS replies_parent_id_idx ON replies(parent_id);
CREATE INDEX IF NOT EXISTS replies_user_id_idx ON replies(user_id);
CREATE INDEX IF NOT EXISTS replies_created_at_idx ON replies(created_at DESC);
CREATE INDEX IF NOT EXISTS notification_tokens_user_id_idx ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on replies table
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notification_tokens table
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Replies policies
CREATE POLICY "Anyone can view replies" 
  ON replies FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create replies" 
  ON replies FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
  ON replies FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Notification tokens policies
CREATE POLICY "Users can view their own tokens" 
  ON notification_tokens FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" 
  ON notification_tokens FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
  ON notification_tokens FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
  ON notification_tokens FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ============================================
-- Functions for notifications and replies
-- ============================================

-- Function to get reply count for a post or chat
CREATE OR REPLACE FUNCTION get_reply_count(p_parent_id UUID, p_parent_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reply_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reply_count
  FROM replies
  WHERE parent_id = p_parent_id AND parent_type = p_parent_type;
  
  RETURN reply_count;
END;
$$;

-- Function to get replies for a post or chat
CREATE OR REPLACE FUNCTION get_replies(p_parent_id UUID, p_parent_type TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.content,
    r.created_at,
    COALESCE(p.alias, 'Anonymousx7') as username
  FROM replies r
  LEFT JOIN profiles p ON r.user_id = p.id
  WHERE r.parent_id = p_parent_id AND r.parent_type = p_parent_type
  ORDER BY r.created_at ASC;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  
  RETURN unread_count;
END;
$$;

-- ============================================
-- Trigger to create notification when someone replies
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parent_user_id UUID;
  replier_alias TEXT;
BEGIN
  -- Get the user_id of the parent post/chat author
  IF NEW.parent_type = 'post' THEN
    SELECT user_id INTO parent_user_id FROM posts WHERE id = NEW.parent_id;
  ELSIF NEW.parent_type = 'chat' THEN
    SELECT user_id INTO parent_user_id FROM chats WHERE id = NEW.parent_id;
  END IF;
  
  -- Don't notify if user is replying to their own message
  IF parent_user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get the replier's alias
  SELECT alias INTO replier_alias FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification for the parent author
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    parent_user_id,
    'new_reply',
    'New Reply',
    COALESCE(replier_alias, 'Someone') || ' replied to your ' || NEW.parent_type,
    jsonb_build_object(
      'parent_id', NEW.parent_id,
      'parent_type', NEW.parent_type,
      'reply_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for replies
DROP TRIGGER IF EXISTS on_reply_created ON replies;
CREATE TRIGGER on_reply_created
  AFTER INSERT ON replies
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reply();

-- ============================================
-- Trigger to create notification for new chats
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_chat()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_alias TEXT;
  recipient_id UUID;
BEGIN
  -- Get sender's alias
  SELECT alias INTO sender_alias FROM profiles WHERE id = NEW.user_id;
  
  -- Notify all other users about the new chat
  FOR recipient_id IN 
    SELECT id FROM profiles WHERE id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      recipient_id,
      'new_message',
      'New Message',
      COALESCE(sender_alias, 'Someone') || ' sent a message',
      jsonb_build_object('chat_id', NEW.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new chats
DROP TRIGGER IF EXISTS on_chat_created ON chats;
CREATE TRIGGER on_chat_created
  AFTER INSERT ON chats
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_chat();

-- ============================================
-- Trigger to create notification for new posts
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poster_alias TEXT;
  recipient_id UUID;
BEGIN
  -- Get poster's alias
  SELECT alias INTO poster_alias FROM profiles WHERE id = NEW.user_id;
  
  -- Notify all other users about the new post
  FOR recipient_id IN 
    SELECT id FROM profiles WHERE id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      recipient_id,
      'new_post',
      'New Post',
      COALESCE(poster_alias, 'Someone') || ' created a new post',
      jsonb_build_object('post_id', NEW.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS on_post_created ON posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_post();

-- ============================================
-- Update delete_old_feed_items to also delete old replies
-- ============================================

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
  
  -- Delete replies older than 24 hours
  DELETE FROM replies 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete old notifications (keep for 7 days)
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Log the deletion (optional, for debugging)
  RAISE NOTICE 'Deleted old feed items at %', NOW();
END;
$$;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if the tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('replies', 'notification_tokens', 'notifications');

-- Check if the functions exist
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN ('get_reply_count', 'get_replies', 'notify_on_reply', 'notify_on_new_chat', 'notify_on_new_post');

-- ============================================
-- Instructions:
-- ============================================
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase Dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Enable Realtime for the new tables:
--    - Go to Database > Replication
--    - Enable Realtime for: replies, notifications
-- ============================================
