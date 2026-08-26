# 🐛 Bug Fixes Applied

## Issues Fixed

### 1. ✅ Multiple Users Can Now Use "Anonymousx7"

**Problem:** The database had a UNIQUE constraint on the `alias` column, preventing multiple users from using "Anonymousx7".

**Solution:** 
- Removed UNIQUE constraint from `profiles.alias` column
- Updated `PickUsernameScreen.tsx` to skip uniqueness check for "Anonymousx7"

**Code Changes:**
- `src/pages/PickUsernameScreen.tsx` - Lines 91-111
- `database-schema.sql` - Line 25 (removed UNIQUE)
- `database-migration-fix.sql` - New migration file

---

### 2. ✅ Feeds Now Auto-Delete After 24 Hours

**Problem:** Posts and chats weren't being automatically deleted after 24 hours.

**Solution:**
- Verified `delete_old_feed_items()` function exists and works correctly
- Created migration to ensure function is properly set up
- Updated deployment checklist to recommend hourly cron job

**What to Do:**
1. Run `database-migration-fix.sql` in Supabase SQL Editor
2. Set up cron job in Supabase Dashboard (see instructions below)

---

## 🚀 How to Apply These Fixes

### Step 1: Update Your Database

1. **Go to Supabase Dashboard**
2. **Navigate to:** SQL Editor
3. **Copy and paste** the contents of `database-migration-fix.sql`
4. **Click "Run"**

This will:
- Remove the UNIQUE constraint on alias
- Recreate the auto-deletion function

### Step 2: Set Up Cron Job

1. **Go to Supabase Dashboard**
2. **Navigate to:** Database → Cron Jobs
3. **Click:** "Create a new cron job"
4. **Configure:**
   - **Name:** `delete_old_feed_items`
   - **Schedule:** `0 * * * *` (runs every hour)
   - **SQL:** `SELECT delete_old_feed_items();`
5. **Click:** "Create"

### Step 3: Rebuild Your App

```bash
npm run build
```

If using Capacitor:
```bash
npm run build:mobile
```

---

## 🧪 Testing the Fixes

### Test 1: Multiple "Anonymousx7" Users

1. Create a new account
2. Choose "Anonymousx7" as username
3. Create another account
4. Choose "Anonymousx7" again
5. ✅ Both should work without errors

### Test 2: 24-Hour Auto-Deletion

**Option A: Manual Test**
```sql
-- In Supabase SQL Editor
SELECT delete_old_feed_items();
```

**Option B: Check Old Posts**
```sql
-- See how many posts/chats are older than 24 hours
SELECT 
  (SELECT COUNT(*) FROM posts WHERE created_at < NOW() - INTERVAL '24 hours') as old_posts,
  (SELECT COUNT(*) FROM chats WHERE created_at < NOW() - INTERVAL '24 hours') as old_chats;
```

**Option C: Wait and Verify**
- Create a post
- Wait 24+ hours
- Check if it's automatically deleted

---

## 📋 Verification Checklist

After applying fixes, verify:

- [ ] `database-migration-fix.sql` executed successfully
- [ ] Cron job created and active
- [ ] Multiple users can use "Anonymousx7"
- [ ] App builds without errors
- [ ] Old posts/chats are being deleted

---

## 🔍 Technical Details

### Database Changes

**Before:**
```sql
CREATE TABLE profiles (
  alias TEXT NOT NULL UNIQUE,  -- ❌ UNIQUE prevents duplicates
  ...
);
```

**After:**
```sql
CREATE TABLE profiles (
  alias TEXT NOT NULL,  -- ✅ Allows duplicates
  ...
);
```

### Code Changes

**Before:**
```typescript
// Always checked uniqueness for all aliases
const { data: existing } = await supabase
  .from("profiles")
  .select("id")
  .eq("alias", username.trim())
  .neq("id", user.id)
  .maybeSingle();

if (existing) {
  setErrorMessage("Alias already in use.");
  return;
}
```

**After:**
```typescript
// Skip uniqueness check for "Anonymousx7"
if (trimmedUsername.toLowerCase() !== "anonymousx7") {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("alias", trimmedUsername)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    setErrorMessage("Alias already in use.");
    return;
  }
}
```

---

## 🆘 Troubleshooting

### "Alias already in use" error for Anonymousx7

**Cause:** Database migration not applied yet

**Fix:**
1. Run `database-migration-fix.sql` in Supabase
2. Rebuild app: `npm run build`
3. Clear browser cache and try again

### Posts not deleting after 24 hours

**Cause:** Cron job not set up or not running

**Fix:**
1. Check Supabase Dashboard → Database → Cron Jobs
2. Verify `delete_old_feed_items` job exists
3. Check job status (should be "active")
4. Manually run: `SELECT delete_old_feed_items();`

### "Function does not exist" error

**Cause:** Database function not created

**Fix:**
1. Run `database-migration-fix.sql` in Supabase
2. Verify function exists:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'delete_old_feed_items';
   ```

---

## 📝 Files Modified

- ✅ `src/pages/PickUsernameScreen.tsx` - Username validation logic
- ✅ `database-schema.sql` - Removed UNIQUE constraint
- ✅ `database-migration-fix.sql` - New migration file
- ✅ `DEPLOYMENT_CHECKLIST.md` - Added bug fix instructions
- ✅ `BUG_FIXES_README.md` - This file

---

## 🎉 Summary

Both issues are now fixed:

1. **✅ Anyone can use "Anonymousx7"** - No more uniqueness errors
2. **✅ Feeds auto-delete after 24 hours** - Cron job runs hourly

Just apply the database migration and set up the cron job, and you're good to go! 🚀
