# 🚀 XSEVEN Deployment Checklist

## ✅ Completed

- [x] Environment variables set up (.env)
- [x] .env added to .gitignore
- [x] Favicon created
- [x] Meta tags updated
- [x] Page title updated

## 🔧 Critical - Must Do Before Deploy

### 0. Apply Bug Fixes (IMPORTANT!)

**Run this first to fix critical bugs:**
```sql
-- In Supabase SQL Editor, run: database-migration-fix.sql
```

This fixes:
- ✅ Allows multiple users to use "Anonymousx7"
- ✅ Ensures 24-hour auto-deletion works properly

### 1. Database Setup in Supabase

Run these SQL commands in Supabase SQL Editor:

#### Check if functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

You should see:
- `can_user_post`
- `is_chat_locked`
- `get_remaining_posts`
- `delete_old_feed_items`
- `is_admin`
- `ban_user`
- `unban_user`
- `get_admin_analytics`

#### If missing, run the full `database-schema.sql` file

### 2. Enable Row Level Security (RLS)

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

### 3. Set Up Cron Job for Auto-Deletion

In Supabase Dashboard:
1. Go to **Database** → **Cron Jobs**
2. Click **Create a new cron job**
3. Name: `delete_old_feed_items`
4. Schedule: `0 * * * *` (every hour - recommended) or `0 0 * * *` (daily at midnight)
5. SQL: `SELECT delete_old_feed_items();`
6. Click **Create**

**Note:** Hourly deletion ensures feeds clear more reliably. Change to daily if you prefer.

### 4. Make Yourself Admin

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'mayoredoh6@gmail.com'
);
```

### 5. Enable Realtime

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable realtime for these tables:
   - `posts`
   - `chats`
   - `profiles`

## 🧪 Testing Before Deploy

### Test These Features:

- [ ] Sign up new user
- [ ] Login/Logout
- [ ] Pick username
- [ ] Send chat message
- [ ] Create post (test 3-post limit)
- [ ] Check 3-minute chat lockout after posting
- [ ] View profile page
- [ ] Admin dashboard access (as admin)
- [ ] Ban/unban user (as admin)
- [ ] Delete post/chat (as admin)
- [ ] View analytics (as admin)
- [ ] Test on mobile browser
- [ ] Check browser console for errors

## 📦 Deployment Steps

### Deploy to Vercel:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Done!** Your app will be live at `your-app.vercel.app`

## 🔒 Security Checklist

- [x] .env in .gitignore
- [ ] RLS enabled on all tables
- [ ] Email verification enabled (optional)
- [ ] Rate limiting configured (optional)

## 📱 Post-Deployment

### Monitor:
- Supabase Dashboard → Database usage
- Vercel Analytics
- Browser console errors
- User feedback

### When to Upgrade:
- Database approaching 500MB
- Monthly active users > 50,000
- Bandwidth > 2GB/month

## 🆘 Troubleshooting

### Common Issues:

**"Failed to load resource: 400"**
- Check if all database columns exist
- Verify RLS policies

**"Access Denied"**
- Check Supabase URL and keys
- Verify environment variables in Vercel

**"Function does not exist"**
- Run database-schema.sql in Supabase

**Admin button not showing**
- Verify `is_admin = true` in database
- Hard refresh browser (Ctrl+Shift+R)

## 📞 Support

If you encounter issues:
1. Check Supabase logs
2. Check Vercel deployment logs
3. Check browser console
4. Review this checklist

---

**Ready to deploy?** Complete all items marked with [ ] above!
