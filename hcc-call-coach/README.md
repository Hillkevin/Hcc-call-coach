# HCC Builder Call Coach

AI-powered sales call practice tool for Hill Country Cabinets.

## Deploy to Netlify (step-by-step)

### What you'll need
- A free [Netlify account](https://netlify.com)
- A free [GitHub account](https://github.com)
- Your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

---

### Step 1 — Put the files on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it `hcc-call-coach`, set it to **Private**, click **Create repository**
4. On your computer, open Terminal (Mac) or Command Prompt (Windows)
5. Run these commands one at a time:

```
cd path/to/hcc-call-coach
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hcc-call-coach.git
git push -u origin main
```
*(Replace YOUR_USERNAME with your GitHub username)*

---

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select your `hcc-call-coach` repository
5. Build settings will auto-fill from `netlify.toml` — leave them as-is
6. Click **Deploy site**

---

### Step 3 — Add your API key

1. In Netlify, go to your site → **Site configuration** → **Environment variables**
2. Click **Add a variable**
3. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
4. Click **Save**
5. Go to **Deploys** → click **Trigger deploy** → **Deploy site**

---

### Step 4 — Share with your team

Once deployed, Netlify gives you a URL like `https://hcc-call-coach.netlify.app`.

Send that link to your sales reps — no login, no install, just open and practice.

**Optional:** In Netlify → **Domain management**, you can set a custom domain like `coach.hillcountrycabinets.com`.

---

## Updating the app

Whenever you push changes to GitHub, Netlify automatically redeploys.

```
git add .
git commit -m "describe your change"
git push
```
