# 🚀 Quick Setup: Gemini API Key

## Get Your Free API Key (Takes 1 minute!)

### Step 1: Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In
- Use your Google account (Gmail)
- It's completely free!

### Step 3: Create API Key
1. Click the **"Create API Key"** button
2. Choose **"Create API key in new project"** (or select existing project)
3. Your API key will appear - it looks like: `AIzaSyABC123def456GHI789jkl012MNO345pqr`

### Step 4: Copy the Key
Click the copy button or select and copy the entire key

### Step 5: Add to .env.local
1. Open `apps/web/.env.local` file
2. Find the line: `GEMINI_API_KEY=`
3. Paste your key after the `=` sign:
   ```env
   GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
   ```

### Step 6: Restart Dev Server
```bash
# Stop the server (Ctrl+C or Cmd+C)
# Then restart:
cd apps/web
npm run dev
```

## ✅ Test It Works

1. Go to http://localhost:3000/planner
2. Type: "What are the best places in Butwal?"
3. Click Send
4. You should see AI-generated recommendations!

## 🎉 That's It!

Your AI Trip Planner is now powered by Google's Gemini AI!

---

## 💡 Free Tier Limits

- **60 requests per minute** - More than enough for development
- **No credit card required**
- **Unlimited for personal projects**

## 🔒 Security Note

- Never commit your API key to Git
- The `.env.local` file is already in `.gitignore`
- Keep your key private

## ❓ Troubleshooting

**Still seeing "API key not configured"?**
- Make sure there's no space after `GEMINI_API_KEY=`
- Make sure you saved the `.env.local` file
- Make sure you restarted the dev server

**Getting API errors?**
- Check your key is correct (starts with `AIza`)
- Make sure you're connected to the internet
- Check the browser console for detailed errors
