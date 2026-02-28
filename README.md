# 🧠 HireMate AI — Resume Intelligence Engine

AI-powered resume analysis tool that compares your resume against job descriptions, calculates ATS compatibility scores, identifies missing skills, and provides optimized bullet points.

## 🚀 Features (Phase 1)

- **JWT Authentication** — Secure register/login
- **Resume Upload** — PDF parsing with text extraction
- **ATS Score** — Keyword-based scoring engine
- **AI Analysis** — Powered by Google Gemini
  - Missing skills detection
  - Resume improvement suggestions
  - Rewritten optimized bullet points
- **Analysis History** — Track past analyses

## 🛠 Tech Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Frontend | React, Vite, TailwindCSS v4, Redux Toolkit, React Hook Form |
| Backend  | Node.js, Express                                            |
| Database | PostgreSQL                                                  |
| AI       | Google Gemini 1.5 Flash                                     |
| Auth     | JWT + bcrypt                                                |
| Upload   | multer + pdf-parse                                          |

## 📦 Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Database Setup

```sql
CREATE DATABASE hiremate_ai;
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your DB credentials and Gemini API key
npm install
npm run db:init   # Creates tables
npm run dev       # Starts on port 5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev       # Starts on port 5173
```

### 4. Open App

Navigate to `http://localhost:5173`

## 📁 Project Structure

```
HireMate AI/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store & slices
│   │   ├── App.jsx            # Root component
│   │   └── index.css          # Design system
│   └── package.json
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # DB, multer config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # JWT auth middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # AI & ATS services
│   │   └── index.js           # Server entry point
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

| Method | Endpoint                | Auth | Description                |
| ------ | ----------------------- | ---- | -------------------------- |
| POST   | `/api/auth/register`    | ❌   | Register user              |
| POST   | `/api/auth/login`       | ❌   | Login user                 |
| GET    | `/api/auth/profile`     | ✅   | Get profile                |
| POST   | `/api/analysis/analyze` | ✅   | Analyze resume (multipart) |
| GET    | `/api/analysis/history` | ✅   | Get analysis history       |
| GET    | `/api/analysis/:id`     | ✅   | Get specific analysis      |

## 📝 Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiremate_ai
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
CLIENT_URL=http://localhost:5173
```
