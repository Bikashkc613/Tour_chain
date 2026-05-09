# Supabase Setup Instructions

## Issue: Invalid Supabase API Keys

The current `.env.local` file contains invalid Supabase API keys. You need to get the correct keys from your Supabase project dashboard.

## How to Get Your Supabase Keys

1. **Go to your Supabase Project Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `wxsdobqjeuowufhcgobj`

2. **Navigate to Project Settings:**
   - Click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **API** in the settings menu

3. **Copy the Required Keys:**
   
   You need three keys:
   
   - **Project URL**: `https://wxsdobqjeuowufhcgobj.supabase.co` ✅ (Already correct)
   - **Anon/Public Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (longer than anon key)

4. **Update `.env.local`:**

   Replace the current keys with the real ones:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://wxsdobqjeuowufhcgobj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY_HERE
   ```

5. **Restart the Dev Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Current Issue

The keys in `.env.local` look like:
- `sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- `sb_secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

These are **not valid Supabase keys**. Real Supabase keys are JWT tokens that start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`.

## Why This Matters

Without valid keys:
- ❌ Stats won't load on the homepage (shows 0 trekkers, 0 income)
- ❌ Bookings can't be saved to the database
- ❌ User authentication won't work
- ❌ All API calls to Supabase will fail

## After Fixing

Once you update the keys:
- ✅ Homepage stats will show real booking data
- ✅ Bookings will be saved to the database
- ✅ All features will work correctly
