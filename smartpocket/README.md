# SmartPocket

Pocket-money management app for Parents and Students — deterministic bucket
split (Emergency / Saving / Enjoyment), rule-based nudges, and an optional
AI-written friendly explanation layer (Groq).

**Stack:** React (Vite) + Tailwind · Firebase Auth + Firestore · Groq API via
a Vercel serverless function · Hosted on Vercel · 100% free tiers.

---

## 1. Project structure

```
smartpocket/
├── frontend/              → React app (Vite)
│   ├── src/
│   │   ├── firebase.js         → Firebase init (reads env vars)
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/splitEngine.js    → deterministic split math (no deps)
│   │   ├── utils/nudgeEngine.js    → rule-based alerts (no deps)
│   │   ├── utils/firestoreHelpers.js
│   │   ├── pages/ (Login, Signup, ParentDashboard, StudentDashboard)
│   │   └── components/ (WalletCard, AddMoneyModal, ExpenseForm, ...)
│   └── .env.example        → Firebase config var names
├── api/
│   └── ai-suggestion.js    → Vercel serverless function calling Groq
├── tests/splitEngine.test.js
├── firestore.rules
├── vercel.json
└── .env.example            → GROQ_API_KEY (set in Vercel dashboard)
```

---

## 2. Local development me VS Code me chalana

1. **VS Code me project folder open karo** (File → Open Folder → `smartpocket`).
2. Terminal open karo (`` Ctrl+` ``) aur dependencies install karo:
   ```bash
   cd frontend
   npm install
   ```
3. `frontend/.env.example` ko copy karke `frontend/.env` banao aur Firebase
   values fill karo (step 3 dekho neeche):
   ```bash
   cp .env.example .env
   ```
4. Dev server start karo:
   ```bash
   npm run dev
   ```
   Browser me `http://localhost:5173` open hoga.

   Note: local dev me `/api/ai-suggestion` sirf Vercel par hi kaam karega
   (ya `vercel dev` se). Local testing ke liye AI call fail hogi to
   automatically fallback message dikhega — app kabhi break nahi hoga.

---

## 3. Firebase project setup (free Spark plan)

1. [console.firebase.google.com](https://console.firebase.google.com) par jao
   → **Add project** → naam do (e.g. `smartpocket`) → continue.
2. Left sidebar me **Build → Authentication** → **Get started** →
   **Email/Password** provider ko **Enable** karo.
3. **Build → Firestore Database** → **Create database** → shuru me
   **test mode** select karo (baad me production rules lagayenge).
4. **Project Settings (gear icon) → General** → scroll down to
   **Your apps** → **Web app (</>) icon** par click karke ek web app
   register karo (nickname kuch bhi).
5. Firebase tumhe ek config object dega jaisa:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "smartpocket-xxxx.firebaseapp.com",
     projectId: "smartpocket-xxxx",
     storageBucket: "smartpocket-xxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   Ye values `frontend/.env` me daalo (matching `VITE_FIREBASE_*` names).
6. **Production security rules lagana:** Firestore console → **Rules** tab
   → is repo ki `firestore.rules` file ka content paste karke **Publish**
   karo. Ye ensure karta hai ki student sirf apna data padh/likh sake aur
   parent sirf apne linked children ka data dekh sake (likh nahi sake,
   sirf split settings/schedule likh sake).

---

## 4. Free Groq API key lena

1. [console.groq.com](https://console.groq.com) par sign up/login karo
   (free tier).
2. **API Keys** section me jao → **Create API Key** → key copy karo.
3. Ye key kahin bhi `frontend/` ya client code me mat daalna — sirf
   Vercel Environment Variable me daalenge (step 6).

---

## 5. VS Code se GitHub par upload karna

1. VS Code me left sidebar me **Source Control** icon (branch jaisa icon)
   par click karo.
2. Agar repo abhi Git-initialized nahi hai to **"Initialize Repository"**
   button dikhega — usko click karo. (Terminal se bhi kar sakte ho:
   `git init` project root me.)
3. `.gitignore` already is repo me hai — ye `.env`, `node_modules` waghera
   ko commit hone se rokega (secrets safe rahenge).
4. Source Control panel me saari changed files dikhengi. **"+"** icon se
   sab stage karo, phir commit message likho (e.g. "Initial SmartPocket
   commit") aur **checkmark (✓ Commit)** button dabao.
5. Ab GitHub par ek naya **empty repository** banao
   (github.com → New repository → koi README/gitignore select mat karo,
   kyunki wo already local me hai).
6. VS Code me **"..."** menu (Source Control panel ke top) → **Remote →
   Add Remote** → apna GitHub repo URL paste karo (e.g.
   `https://github.com/username/smartpocket.git`).
   Terminal se:
   ```bash
   git remote add origin https://github.com/username/smartpocket.git
   git branch -M main
   git push -u origin main
   ```
7. VS Code GitHub login maangega (browser me authorize karo) — ek baar
   authorize karne ke baad future pushes "Sync Changes" button se hi ho
   jayenge.

---

## 6. Vercel par deploy karna

1. [vercel.com](https://vercel.com) par GitHub account se sign up/login
   karo.
2. **Add New → Project** → apna abhi push kiya hua `smartpocket` repo
   import karo.
3. **Framework Preset:** Vite auto-detect ho jayega. Root directory
   default (`./`) hi rehne do — is repo ka `vercel.json` already batata
   hai ki frontend kaise build hogi aur `api/` folder automatically
   serverless functions ban jayega.
4. **Environment Variables** section me ye sab add karo (Vercel dashboard
   me, kabhi bhi code me nahi):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `GROQ_API_KEY`
5. **Deploy** button dabao. 1-2 minute me build ho jayega aur ek live URL
   milega (e.g. `smartpocket.vercel.app`).
6. Aage se jab bhi tum `main` branch par push karoge (VS Code se "Sync
   Changes"), Vercel automatically redeploy kar dega.

---

## How the pieces fit together

- **Split math** (`frontend/src/utils/splitEngine.js`) is 100% deterministic
  and works with zero network calls — this is the core and the app stays
  fully usable even if Firebase or Groq are down.
- **Nudges** (`frontend/src/utils/nudgeEngine.js`) are also pure rule-based
  logic — instant, no API cost.
- **Groq** (`api/ai-suggestion.js`) is only used to phrase a friendly
  explanation of numbers that are already computed. If the key is missing
  or the call fails, a pre-written fallback message is shown instead — the
  app never breaks.
- **Firestore security rules** enforce that students own their data and
  parents get read-only visibility into their linked children plus
  write access to split settings and pocket-money schedules.

Run `node tests/splitEngine.test.js` any time to verify the split math.
