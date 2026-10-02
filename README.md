# 🚀 MockMate — AI-Powered & Peer-to-Peer Mock Interview Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache_6-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.16-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

**MockMate** is an end-to-end, production-grade SaaS web platform designed to revolutionize interview preparation. By combining cutting-edge **Google Gemini AI**, **real-time peer-to-peer WebRTC video rooms**, and **intelligent ATS resume analysis**, MockMate empowers job seekers to practice, analyze, and master technical and behavioral interviews.

---

## 🌟 Key Features

### 🤖 1. AI Mock Interviews
- **Dynamic Question Generation**: Leverages Google Gemini AI to generate role-tailored technical and behavioral interview questions based on candidate experience, industry, and topic preferences.
- **Real-Time Audio & Speech Analysis**: Voice recording with real-time waveform visualization, time management tracking, and response recording.
- **Instant AI Scoring & Feedback**: Detailed scoring breakdowns across technical accuracy, communication clarity, confidence, and pacing with actionable tips for improvement.

### 📄 2. Smart Resume Analyzer
- **PDF Parsing & Skill Extraction**: Automated resume parsing powered by `pdf-parse` to identify core competencies, programming languages, and industry frameworks.
- **ATS Match Score**: Evaluates resume match percentages against job descriptions.
- **Actionable Bullet Point Suggestions**: Offers quantitative metrics recommendations to increase resume response rates.

### 🤝 3. Peer-to-Peer Interview Rooms
- **1:1 Live Practice Sessions**: Real-time peer matching for interactive mock interviews using WebRTC and Socket.IO.
- **Shared Code Editor & Video Stream**: Synchronized collaborative workspace with video/audio feeds.
- **Mutual Feedback Rating**: Candidate rating system for constructive peer feedback.

### 📊 4. Interview Analytics & Progress Tracking
- **Performance History**: Visual dashboard displaying historical performance trends, score distributions, and completed interview metrics.
- **Strengths & Weakness Analysis**: Granular metrics highlighting areas needing reinforcement.

### 💬 5. WhatsApp & Email Reminders
- **Automated Notifications**: Node-cron scheduled email and WhatsApp reminders via Nodemailer and Twilio for upcoming practice sessions.

### 🎨 6. Unified Global Visual Design System
- **Dark-First Modern SaaS Aesthetic**: Custom design system using `#09090B` dark void, `#15131C` surface layers, and `#6366F1` → `#A855F7` → `#D946EF` 3-stop accent gradients.
- **Seamless Light & Dark Theme Toggle**: Full support for both dark and light modes with system preference fallbacks and `localStorage` persistence.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS tokens + Tailwind CSS v4
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Real-time Engine**: Socket.IO Client
- **Facial AI / Vision**: `@vladmandic/face-api`

### Backend
- **Runtime**: Node.js + Express 5
- **Database**: MongoDB (via Mongoose 9)
- **In-Memory Cache**: Redis Client v6
- **AI Core**: Google GenAI SDK (`@google/genai`)
- **File & Media Storage**: Cloudinary, Multer, Streamifier
- **Security & Auth**: JWT (JSON Web Tokens), `bcryptjs`, Cookie Parser, Helmet, Express Rate Limit
- **Payments**: Razorpay Node SDK
- **Scheduling**: Node-cron

---

## 📁 Project Structure

```
MockMate/
├── backend/
│   ├── config/             # DB, Redis, Cloudinary & AI configuration
│   ├── controllers/        # Route logic (Auth, Interview, Resume, WhatsApp, Payments)
│   ├── middleware/         # Auth verification, rate limiting, error handling
│   ├── models/             # Mongoose schemas (User, Interview, Resume, Report)
│   ├── routes/             # Express API routes
│   ├── services/           # AI prompt generators, Email & WhatsApp services
│   ├── utils/              # Helper utilities & validators
│   ├── server.js           # Express app & Socket.IO initialization
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets & icons
│   ├── src/
│   │   ├── assets/         # Images & graphic tokens
│   │   ├── components/     # UI Components (Header, Footer, FeatureShowcase, Dashboard)
│   │   ├── context/        # AuthContext, ThemeContext, SocketContext
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Landing, Login, Register, ForgotPassword, Dashboard, PeerRoom
│   │   ├── services/       # Axios API client instances
│   │   ├── index.css       # Centralized Design System tokens & utilities
│   │   └── main.jsx        # Application root entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables Setup

### 1. Backend Environment Variables (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database & Cache
MONGO_URI=mongodb://localhost:27017/mockmate
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google Gemini AI API
GEMINI_API_KEY=your_google_gemini_api_key_here

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Twilio / WhatsApp Integration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Redis** (Local instance or Upstash Redis)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Somyaaa10/MockMate.git
cd MockMate
```

---

### Step 2: Install & Run Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon
npm run dev
```

*The backend server will run on `http://localhost:5000`.*

---

### Step 3: Install & Run Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

*The frontend application will run on `http://localhost:5173`.*

---

## 📑 Key API Endpoints

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Send password reset token email |
| `POST` | `/api/auth/reset-password` | Reset password using reset token |

### 🤖 AI Interview Routes (`/api/interviews`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/interviews/generate` | Generate AI mock interview questions |
| `POST` | `/api/interviews/evaluate` | Submit answers & receive Gemini AI feedback |
| `GET` | `/api/interviews/history` | Retrieve past mock interview reports |

### 📄 Resume Analysis Routes (`/api/resume`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resume/analyze` | Upload PDF resume for AI parsing & scoring |
| `GET` | `/api/resume/saved` | Fetch historical resume analysis reports |

### 🤝 Peer-to-Peer Routes (`/api/peer`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/peer/match` | Queue candidate for 1:1 peer matching |
| `GET` | `/api/peer/room/:roomId` | Validate active peer interview room session |

---

## 🎨 Global Design Tokens

MockMate's centralized theme palette is defined in `index.css`:

```css
/* Dark Theme Tokens */
html[data-theme="dark"] {
  --background: #09090B;
  --background-soft: #0D0B12;
  --surface: #15131C;
  --border: #292532;
  --text-primary: #F8F7FF;
  --text-secondary: #A9A3B8;
  --primary: #7C5CFF;
  --primary-pink: #D946EF;
}

/* 3-Stop Accent Gradient */
linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #D946EF 100%)
```

---

## 🛡️ Building for Production

To test or generate production bundles:

```bash
# Frontend Build
cd frontend
npm run build

# Backend Production Start
cd backend
npm start
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <b>MockMate</b> — Built for better interviews.
</p>
