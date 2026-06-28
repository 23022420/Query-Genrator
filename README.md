# QueryNova – AI-Powered SQL Generator

> Convert natural language to SQL instantly using Groq AI (free) + MongoDB Atlas (free).  
> Full MERN stack: React frontend · Express backend · MongoDB database · JWT auth.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🤖 AI SQL Generation | Natural language → SQL using Groq (Llama 3 70B) |
| 💡 Query Explanation | Plain-English explanation of any SQL |
| ✨ Query Optimization | AI-powered performance suggestions |
| 🔧 Auto Fix | Detect and fix SQL syntax errors |
| ⚠️ Danger Detection | Warns on DROP / DELETE without WHERE / TRUNCATE |
| 📊 Difficulty Analyzer | Easy / Medium / Hard classification |
| 🗂️ Schema Explorer | Paste DB schema → AI parses tables & columns |
| 📜 Query History | Search, filter, favorite, export |
| 💾 Saved Queries | Save, tag, edit, favorite queries |
| 👤 Auth System | JWT, bcrypt, role-based (Admin / User) |
| 🛡️ Security | Helmet, rate limiting, XSS protection, input validation |
| 📈 Dashboard | Charts, stats, analytics |
| 👨‍💼 Admin Panel | User management, system stats |

---

## 🚀 Prerequisites

Make sure these are installed:

- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (comes with Node.js)
- A modern browser (Chrome, Firefox, Edge)

---

## 🔑 Step 1 – Get Free API Keys

### A) MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/atlas
2. Click **"Try Free"** and create an account
3. Create a new **free cluster** (M0 tier — always free)
4. Click **"Database Access"** → Add a database user with a username/password
5. Click **"Network Access"** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **"Connect"** → **"Connect your application"**
7. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<username>` and `<password>` with your database user credentials
9. Add `/querynova` before the `?` to specify the database name:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/querynova?retryWrites=true&w=majority
   ```

### B) Groq API Key (Free AI)

1. Go to https://console.groq.com
2. Sign up for a free account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Copy the key (starts with `gsk_...`)

---

## ⚙️ Step 2 – Configure the Backend

1. Open the `backend/` folder
2. Copy `.env.example` to create a new file called `.env`:

   **On Windows (Command Prompt):**
   ```
   copy backend\.env.example backend\.env
   ```

   **On Mac/Linux:**
   ```
   cp backend/.env.example backend/.env
   ```

3. Open `backend/.env` in any text editor (Notepad, VS Code, etc.)
4. Fill in your values:

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/querynova?retryWrites=true&w=majority
   JWT_SECRET=any_long_random_string_at_least_32_chars_like_thisOne123!
   JWT_EXPIRES_IN=7d
   GROQ_API_KEY=gsk_your_groq_key_here
   NODE_ENV=development
   ```

   > **JWT_SECRET**: Make up any long random string. Example: `mySuperSecret_QueryNova_JWT_2024!`

---

## 📦 Step 3 – Install Dependencies

Open a terminal in the project root (the `querynova/` folder) and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

---

## ▶️ Step 4 – Run the Project

You need **two terminal windows** running simultaneously.

### Terminal 1 – Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Terminal 2 – Frontend

```bash
cd frontend
npm start
```

The browser should automatically open at **http://localhost:3000**

---

## 👤 Step 5 – Create Your Account

1. Go to http://localhost:3000
2. Click **"Create one"** to register
3. Fill in your name, email, and a password
   - Password must have uppercase, lowercase, and a number
   - Example: `MyPass123`
4. You'll be logged in automatically

---

## 🛡️ Creating an Admin Account

To access the Admin Panel:

1. Register normally as a user
2. Open MongoDB Atlas → Browse Collections → querynova → users
3. Find your user document
4. Change `"role": "user"` to `"role": "admin"`
5. Save — you'll now see the Admin menu in the sidebar

---

## 💡 How to Use

### Generate SQL
1. Click **"SQL Generator"** in the sidebar
2. Type a natural language prompt, e.g.:
   - "Show all employees with salary above 50000"
   - "Find top 5 customers by total orders this month"
3. Press **"Generate SQL"** or use **Ctrl+Enter**

### Use Your Schema
1. Go to **Schema Explorer**
2. Click **"Add Schema"**
3. Paste your `CREATE TABLE` statements
4. Click **"Parse & Save"**
5. Back in Generator, select your schema from the dropdown for smarter SQL

### Other Features
- **Explain** button → Plain English explanation of any SQL
- **Optimize** button → Get performance suggestions
- **Auto Fix** button → Fix SQL syntax errors
- **History** → View all past queries, filter, search, favorite
- **Saved Queries** → Save frequently used queries with tags

---

## 🏗️ Project Structure

```
querynova/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── .env                   # Your configuration (create this)
│   ├── .env.example           # Template
│   └── src/
│       ├── config/
│       ├── controllers/       # Route handlers
│       │   ├── authController.js
│       │   ├── queryController.js
│       │   ├── historyController.js
│       │   ├── savedController.js
│       │   ├── schemaController.js
│       │   └── adminController.js
│       ├── middleware/
│       │   ├── auth.js        # JWT middleware
│       │   └── validate.js    # Input validation + XSS
│       ├── models/
│       │   ├── User.js
│       │   ├── QueryHistory.js
│       │   ├── SavedQuery.js
│       │   └── DBSchema.js
│       ├── routes/            # Express routers
│       └── utils/
│           ├── groqService.js # All Groq AI calls
│           └── jwt.js
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js             # Routing
        ├── index.js
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── utils/
        │   └── api.js         # Axios API client
        ├── styles/
        │   └── globals.css
        ├── components/
        │   └── layout/
        │       └── Layout.js  # Sidebar + topbar
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── GeneratorPage.js
            ├── HistoryPage.js
            ├── SavedPage.js
            ├── SchemaPage.js
            ├── SettingsPage.js
            └── AdminPage.js
```

---

## 🔒 Security Features

- **JWT Authentication** with expiry
- **bcrypt** password hashing (12 rounds)
- **Helmet.js** for secure HTTP headers
- **Rate limiting**: 100 req/15min globally, 15 req/min for AI endpoints
- **XSS protection** on all inputs
- **express-validator** for all user inputs
- **Role-based access control** (admin / user)
- **CORS** configured for localhost only in development

---

## ❗ Troubleshooting

**Backend says "MongoDB connection error"**
- Check your `MONGODB_URI` in `.env` is correct
- Make sure you whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access
- Confirm your DB username/password are correct

**"Failed to generate SQL"**
- Check your `GROQ_API_KEY` in `.env`
- Make sure it starts with `gsk_`
- Visit https://console.groq.com to verify your key is active

**Port already in use**
- Change `PORT=5001` in your `.env` and update `"proxy"` in `frontend/package.json` to `http://localhost:5001`

**npm install fails**
- Make sure Node.js v18+ is installed: `node --version`
- Try deleting `node_modules` and `package-lock.json` and running `npm install` again

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/query/generate | Generate SQL from prompt |
| POST | /api/query/explain | Explain SQL |
| POST | /api/query/optimize | Optimize SQL |
| POST | /api/query/autofix | Fix SQL errors |
| POST | /api/query/danger | Detect dangerous SQL |
| GET | /api/history | Get query history |
| GET | /api/history/stats | History statistics |
| GET | /api/saved | Get saved queries |
| POST | /api/saved | Save a query |
| GET | /api/schema | Get DB schemas |
| POST | /api/schema | Create schema |
| GET | /api/admin/stats | Admin stats |
| GET | /api/admin/users | All users |

---

## 🆓 Free Tier Limits

| Service | Free Limit |
|---|---|
| MongoDB Atlas | 512 MB storage, unlimited reads/writes |
| Groq API | ~14,400 requests/day (rate limited by minute) |

Both are more than enough for development and personal use.
