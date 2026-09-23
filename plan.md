# MockMate --- AI Mock Interview Platform

## Project Implementation Plan

> **Project goal:** Build a production-style AI mock interview platform
> where a user's resume becomes the context for an adaptive, real-time
> AI interviewer. The AI does not generate a fixed list of questions
> beforehand. It asks a question, evaluates the user's answer, and
> dynamically decides what to ask next.

------------------------------------------------------------------------

# 1. Product Vision

MockMate combines:

-   AI-powered mock interviews
-   Resume analysis
-   Adaptive real-time questioning
-   AI interview feedback
-   Peer-to-peer video interviews
-   Interview history and analytics
-   Subscription-based interview limits
-   Payment processing
-   Email/WhatsApp notifications

### Core differentiator

``` text
Resume
  ↓
AI Resume Analysis
  ↓
Candidate Profile
  ↓
Start AI Interview
  ↓
AI asks Question
  ↓
User answers
  ↓
AI evaluates answer
  ↓
AI chooses next question
  ↓
Adaptive interview continues
  ↓
Final AI report
```

The interview should feel like an actual interviewer rather than a
static questionnaire.

------------------------------------------------------------------------

# 2. Technology Stack

## Frontend

-   React
-   JavaScript
-   Vite
-   Tailwind CSS
-   React Router
-   Redux Toolkit
-   React Query / TanStack Query
-   Axios
-   React Hook Form
-   Framer Motion
-   Chart.js
-   Socket.io Client
-   WebRTC APIs
-   Lucide React

## Backend

-   Node.js
-   Express
-   JavaScript
-   MongoDB
-   Mongoose
-   JWT
-   bcrypt
-   Redis
-   Socket.io
-   WebRTC signaling
-   Gemini API
-   Multer
-   Cloudinary
-   Razorpay
-   WhatsApp Cloud API
-   Nodemailer

## Deployment

-   Frontend: Vercel
-   Backend: Railway / Render
-   Database: MongoDB Atlas
-   Redis: Upstash
-   Media: Cloudinary

------------------------------------------------------------------------

# 3. Project Structure

``` text
mockmate/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── jobs/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── package.json
│   └── .env
│
├── docs/
├── README.md
└── plan.md
```

------------------------------------------------------------------------

# 4. UI/UX Direction

The provided InterviewPro screenshots are used only as visual
inspiration.

## Design language

-   Dark-first premium SaaS UI
-   Near-black page backgrounds
-   Dark charcoal cards
-   Purple/pink gradient primary actions
-   Subtle blue, cyan, green and orange accents
-   Rounded cards
-   Thin borders
-   Soft glow effects
-   Large bold headings
-   Clean modern typography
-   Consistent iconography
-   Responsive desktop/tablet/mobile layouts
-   Framer Motion transitions

## Important design principle

Do not clone the reference UI.

Use its:

-   visual hierarchy
-   dashboard organization
-   pricing-card concept
-   usage display
-   peer-room layout
-   dark premium aesthetic

while making MockMate's interface and branding original.

------------------------------------------------------------------------

# 5. Public Pages

## Landing Page

Route:

``` text
/
```

Sections:

1.  Navbar
2.  Hero
3.  How MockMate works
4.  AI interview feature
5.  Resume analysis feature
6.  Peer interview feature
7.  AI feedback feature
8.  Analytics feature
9.  Pricing
10. FAQ
11. CTA
12. Footer

### Hero message

Suggested positioning:

> Your Resume. Your Skills. Your AI Interviewer.

Supporting message:

> Practice interviews that adapt to your answers in real time.

Primary CTA:

``` text
Start 2 Free Interviews
```

Secondary CTA:

``` text
Watch Demo
```

------------------------------------------------------------------------

# 6. Authentication

Routes:

``` text
/register
/login
/forgot-password
/reset-password/:token
/verify-email
```

Features:

-   Register
-   Login
-   Logout
-   JWT authentication
-   Access token
-   Refresh token
-   Password hashing with bcrypt
-   Email verification
-   Forgot password
-   Reset password
-   Protected routes
-   Optional Google OAuth later

## Authentication flow

``` text
Register
  ↓
Validate input
  ↓
Hash password
  ↓
Create user
  ↓
Send verification email
  ↓
Verify email
  ↓
Login
  ↓
Access + Refresh Token
```

------------------------------------------------------------------------

# 7. User Dashboard

Route:

``` text
/dashboard
```

## Navigation

``` text
Overview
AI Interview
Peer Interview
Resume
Reports
Plan
Profile
```

## Dashboard cards

Show:

-   Current plan
-   AI interviews used
-   AI interviews remaining
-   Resume status
-   Average score
-   Best score
-   Total interviews
-   Recent interview

Example:

``` text
AI Interviews
1 / 2 used

Average Score
78%

Resume
Analyzed ✓

Current Plan
FREE
```

------------------------------------------------------------------------

# 8. Profile

Route:

``` text
/profile
```

Profile fields:

-   Full name
-   Email
-   Phone
-   Profile photo
-   Designation
-   Bio
-   Target role
-   Experience level
-   Preferred interview domains
-   Skills

The profile should become part of the AI interview context.

------------------------------------------------------------------------

# 9. Resume Analyzer

Routes:

``` text
/resume
/resume/analysis
```

## Upload

Accept:

``` text
PDF
```

Flow:

``` text
Upload Resume
  ↓
Multer
  ↓
Cloudinary
  ↓
Extract resume text
  ↓
Gemini
  ↓
Structured analysis
  ↓
Save analysis
```

## AI extracts

-   Name
-   Email
-   Phone
-   Skills
-   Experience
-   Companies
-   Job roles
-   Projects
-   Education
-   Certifications
-   Technologies
-   Strengths
-   Weaknesses
-   Suggested interview topics

## Example result

``` text
Skills
React
Node.js
MongoDB
Redis

Experience
Full Stack Developer Intern

Projects
E-commerce Platform
Hospital Management System

Education
B.Tech Computer Science
```

## Resume analysis score

Generate:

``` text
Overall Resume Score
Skills Score
Experience Score
Project Score
ATS Readiness
Content Quality
```

## Important

The analyzed resume becomes context for the AI interviewer.

------------------------------------------------------------------------

# 10. Candidate AI Context

Create a normalized candidate context.

``` javascript
{
  userId,
  targetRole,
  experienceLevel,

  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],

  resumeStrengths: [],
  resumeWeaknesses: [],

  preferredTopics: []
}
```

This context is used when starting an AI interview.

------------------------------------------------------------------------

# 11. AI Interview --- Core Feature

Route:

``` text
/ai-interview
/ai-interview/setup
/ai-interview/session/:id
/ai-interview/report/:id
```

## Interview setup

User selects:

-   Target role
-   Interview type
-   Difficulty
-   Focus skills
-   Experience level
-   Optional job description

Examples:

``` text
Frontend Developer
Backend Developer
Full Stack Developer
Java Developer
Python Developer
Node.js Developer
React Developer
HR
System Design
```

------------------------------------------------------------------------

# 12. Adaptive Real-Time Interview Engine

This is the most important part of MockMate.

## Do NOT use this architecture

``` text
Generate 10 questions
  ↓
Question 1
Question 2
Question 3
...
```

## Use this architecture

``` text
Start Interview
  ↓
Load Candidate Context
  ↓
Generate Initial Question
  ↓
User Answers
  ↓
Analyze Answer
  ↓
Determine Next Question
  ↓
User Answers
  ↓
Analyze Answer
  ↓
Determine Next Question
  ↓
...
  ↓
Final Evaluation
```

------------------------------------------------------------------------

# 13. Adaptive Question Decision

After every answer, Gemini should determine:

-   Answer quality
-   Technical correctness
-   Communication quality
-   Missing concepts
-   Strong concepts
-   Weak concepts
-   Whether follow-up is required
-   Whether difficulty should increase
-   Whether difficulty should decrease
-   Whether to switch topic
-   Next question
-   Interview completion decision

Example:

``` text
Resume:
React + Node.js + Redis

Question:
Why did you use Redis in your project?

Answer:
User gives incomplete explanation.

AI detects:
Redis knowledge = weak

Next question:
Can you explain what problem Redis solves and
when you would choose it over MongoDB?
```

------------------------------------------------------------------------

# 14. Gemini Interview Response

The backend should request structured JSON from Gemini.

Example:

``` json
{
  "score": 78,
  "technicalScore": 82,
  "communicationScore": 74,
  "strengths": [
    "Understands Redis caching basics"
  ],
  "weaknesses": [
    "Could not explain cache invalidation"
  ],
  "shouldFollowUp": true,
  "difficulty": "MEDIUM",
  "nextQuestion": "How would you handle cache invalidation in Redis?",
  "topic": "Redis",
  "shouldEnd": false
}
```

The backend validates the AI response before saving or displaying it.

------------------------------------------------------------------------

# 15. Interview Session State

Possible states:

``` text
CREATED
READY
IN_PROGRESS
WAITING_FOR_ANSWER
ANALYZING
NEXT_QUESTION
COMPLETED
CANCELLED
```

## Session flow

``` text
CREATED
  ↓
READY
  ↓
IN_PROGRESS
  ↓
WAITING_FOR_ANSWER
  ↓
ANALYZING
  ↓
NEXT_QUESTION
  ↓
WAITING_FOR_ANSWER
  ↓
...
  ↓
COMPLETED
```

------------------------------------------------------------------------

# 16. Interview Limits / Subscription

## Core business rule

A Free user gets:

``` text
2 AI interviews
```

When the user subscribes, their allowed interview quota increases
according to the selected plan.

The interview quota is the primary monetization control.

## Example plans

### Free

``` text
₹0/month

AI Interviews: 2
Basic AI feedback
Interview history
Basic profile
```

### Pro

Example configuration:

``` text
₹XXX/month

AI Interviews: 20
Resume AI analysis
Adaptive AI interviews
Detailed feedback
Advanced analytics
Peer interviews
Recording
WhatsApp reminders
```

### Enterprise

Optional future plan:

``` text
Custom pricing

Team management
Candidate management
Advanced analytics
Admin controls
Custom integrations
```

Exact pricing can be configured later.

------------------------------------------------------------------------

# 17. Interview Quota Logic

Do not consume a quota when the user only opens the setup page.

Consume one interview when the user actually starts an interview
session.

``` text
Open Setup
  ↓
No quota consumed
  ↓
Click Start Interview
  ↓
Backend checks subscription
  ↓
Check remaining quota
  ↓
Create session
  ↓
Consume 1 interview
```

Example:

``` text
Free

Limit: 2
Used: 1
Remaining: 1
```

After another interview:

``` text
Limit: 2
Used: 2
Remaining: 0
```

Next attempt:

``` text
Interview limit reached
        ↓
Upgrade to Pro
```

------------------------------------------------------------------------

# 18. Backend Quota Enforcement

Never rely only on the frontend.

Endpoint:

``` text
POST /api/interviews/start
```

Backend:

``` text
Authenticate
  ↓
Get user subscription
  ↓
Get current usage
  ↓
Check quota
  ↓
Allowed?
 ├── Yes → create interview
 └── No → return upgrade response
```

Example response:

``` json
{
  "success": false,
  "code": "INTERVIEW_LIMIT_REACHED",
  "message": "You have used all 2 AI interviews.",
  "upgradeRequired": true
}
```

------------------------------------------------------------------------

# 19. Usage Model

Track usage separately so the system can support future plans.

Example:

``` javascript
{
  userId,
  periodStart,
  periodEnd,

  aiInterviewsUsed,
  aiInterviewsLimit,

  resumeAnalysesUsed,
  peerInterviewsUsed,

  createdAt,
  updatedAt
}
```

The plan determines the limit.

------------------------------------------------------------------------

# 20. AI Interview UI

The AI interview screen should feel like an interviewer, not a quiz.

``` text
AI Interviewer

Question 4

"You mentioned Redis in your project.
Can you explain why you chose Redis?"

----------------------------------

Your Answer

[ Type your answer here... ]

[ 🎙 Speak ]       [ Submit Answer ]

Question progress
4 / adaptive
```

The interface can show:

-   AI avatar
-   Question
-   Listening state
-   Thinking/analyzing state
-   Answer input
-   Timer
-   Progress
-   End interview
-   Connection status

------------------------------------------------------------------------

# 21. Voice AI --- Future Enhancement

After text adaptive interviewing is stable:

``` text
User speaks
  ↓
Speech-to-Text
  ↓
Answer transcript
  ↓
Gemini analysis
  ↓
Next question
  ↓
Text-to-Speech
  ↓
AI speaks
```

This should be implemented after the text interview engine is reliable.

------------------------------------------------------------------------

# 22. AI Feedback Report

After completion:

``` text
Overall Score
82%

Technical Knowledge
86%

Communication
78%

Problem Solving
84%

Confidence
75%
```

Additional sections:

-   Strengths
-   Weaknesses
-   Technical mistakes
-   Communication feedback
-   Grammar feedback
-   Suggested answers
-   Recommended topics
-   Interview summary
-   Improvement plan

------------------------------------------------------------------------

# 23. Performance Analytics

Route:

``` text
/reports
```

Show:

-   Interview count
-   Average score
-   Best score
-   Recent score
-   Skill progress
-   Monthly activity
-   Technical score trend
-   Communication trend

Charts:

``` text
Score Progress
Skill Progress
Interview Activity
Category Performance
```

------------------------------------------------------------------------

# 24. Peer-to-Peer Interviews

Route:

``` text
/peer-interview
/peer-interview/create
/peer-interview/room/:id
```

Flow:

``` text
User A
  ↓
Create Room
  ↓
Generate Room ID
  ↓
Share Link
  ↓
User B joins
  ↓
Socket.io signaling
  ↓
WebRTC connection
  ↓
Video interview
  ↓
Interview ends
  ↓
Feedback
  ↓
Save session
```

------------------------------------------------------------------------

# 25. Peer Interview Room

Features:

-   Camera
-   Microphone
-   Screen sharing
-   Real-time chat
-   Typing indicator
-   Participant status
-   Join/leave events
-   Mute/unmute
-   Camera on/off
-   Connection status
-   Optional recording

UI:

``` text
Remote Participant
                    ┌──────────┐
                    │ You      │
                    │          │
                    └──────────┘

--------------------------------
🎤   📹   🖥   💬   End
```

------------------------------------------------------------------------

# 26. Socket.io

Use Socket.io for:

-   Room creation events
-   Join room
-   Leave room
-   Online status
-   Typing indicator
-   Chat messages
-   WebRTC signaling
-   Call status
-   Interview status

Example events:

``` text
join-room
user-joined
user-left
offer
answer
ice-candidate
send-message
typing
stop-typing
call-ended
```

------------------------------------------------------------------------

# 27. WebRTC

WebRTC is responsible for:

-   Camera stream
-   Microphone stream
-   Peer connection
-   Screen sharing

Socket.io is only used for signaling.

``` text
Browser A
   │
   │ WebRTC Media
   │
   ▼
Browser B

Socket.io
   │
   ├── Offer
   ├── Answer
   └── ICE Candidates
```

------------------------------------------------------------------------

# 28. Payments

Use Razorpay.

Flow:

``` text
Choose Pro
  ↓
Frontend requests order
  ↓
POST /api/payments/create-order
  ↓
Backend creates Razorpay order
  ↓
Payment UI
  ↓
User pays
  ↓
Payment verification
  ↓
Webhook
  ↓
Update subscription
  ↓
Increase interview quota
```

Never trust only the frontend payment success response.

------------------------------------------------------------------------

# 29. Subscription States

Possible states:

``` text
ACTIVE
TRIAL
PAST_DUE
CANCELLED
EXPIRED
```

Store:

-   Plan
-   Start date
-   End date
-   Razorpay subscription/order ID
-   Payment status
-   Renewal status

------------------------------------------------------------------------

# 30. WhatsApp Notifications

Use WhatsApp Cloud API.

Possible messages:

``` text
Interview starts in 15 minutes.

Your peer interview room is ready.

Your Pro subscription is expiring soon.

Your interview report is ready.
```

Notifications should only be sent when the user has opted in and the
required contact information/permissions are available.

------------------------------------------------------------------------

# 31. Email Notifications

Use email for:

-   Email verification
-   Password reset
-   Interview reminder
-   Interview report ready
-   Subscription confirmation
-   Subscription expiry
-   Peer interview invitation

------------------------------------------------------------------------

# 32. Redis

Use Redis for:

-   OTP storage
-   Temporary tokens
-   Rate limiting
-   Session-related temporary state
-   Online users
-   Socket presence
-   Caching
-   Temporary interview locks

Do not use Redis as the permanent source of truth for interview history.

MongoDB remains the persistent database.

------------------------------------------------------------------------

# 33. MongoDB Database Design

Use MongoDB + Mongoose.

## Collections

``` text
users
profiles
resumes
resumeAnalyses
subscriptions
payments
usage
interviewSessions
interviewQuestions
interviewAnswers
feedbackReports
peerRooms
peerParticipants
notifications
refreshTokens
reports
```

------------------------------------------------------------------------

# 34. User Model

``` javascript
{
  name,
  email,
  password,
  role: "USER" | "ADMIN",
  emailVerified,
  avatar,
  createdAt,
  updatedAt
}
```

------------------------------------------------------------------------

# 35. Profile Model

``` javascript
{
  userId,
  phone,
  designation,
  bio,
  targetRole,
  experienceLevel,
  skills: [],
  preferredTopics: [],
  createdAt,
  updatedAt
}
```

------------------------------------------------------------------------

# 36. Resume Model

``` javascript
{
  userId,
  fileUrl,
  publicId,
  fileName,
  fileType,
  uploadedAt,
  analysisStatus
}
```

Possible analysis states:

``` text
PENDING
PROCESSING
COMPLETED
FAILED
```

------------------------------------------------------------------------

# 37. Resume Analysis Model

``` javascript
{
  userId,
  resumeId,

  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],

  strengths: [],
  weaknesses: [],

  resumeScore,
  atsScore,

  recommendedInterviewTopics: [],

  rawAnalysis,
  createdAt,
  updatedAt
}
```

------------------------------------------------------------------------

# 38. Subscription Model

``` javascript
{
  userId,

  plan: "FREE" | "PRO" | "ENTERPRISE",

  interviewLimit,
  interviewsUsed,

  status,

  startDate,
  endDate,

  razorpayCustomerId,
  razorpaySubscriptionId,

  createdAt,
  updatedAt
}
```

------------------------------------------------------------------------

# 39. Interview Session Model

``` javascript
{
  userId,

  type: "AI" | "PEER",

  targetRole,
  interviewType,
  difficulty,

  status,

  resumeId,

  startedAt,
  completedAt,

  questionCount,

  overallScore,

  duration
}
```

------------------------------------------------------------------------

# 40. Interview Question Model

``` javascript
{
  interviewSessionId,

  questionNumber,

  question,
  topic,
  difficulty,

  type: "INITIAL" | "FOLLOW_UP" | "TECHNICAL" | "BEHAVIORAL",

  createdAt
}
```

------------------------------------------------------------------------

# 41. Interview Answer Model

``` javascript
{
  interviewSessionId,
  questionId,
  userId,

  answerText,

  technicalScore,
  communicationScore,

  strengths: [],
  weaknesses: [],

  aiAnalysis,

  answeredAt
}
```

------------------------------------------------------------------------

# 42. Feedback Report Model

``` javascript
{
  interviewSessionId,
  userId,

  overallScore,
  technicalScore,
  communicationScore,
  confidenceScore,
  problemSolvingScore,
  grammarScore,

  strengths: [],
  weaknesses: [],
  suggestions: [],

  recommendedTopics: [],

  summary,

  createdAt
}
```

------------------------------------------------------------------------

# 43. Peer Room Model

``` javascript
{
  roomId,
  hostId,
  participantId,

  status,

  scheduledAt,

  startedAt,
  endedAt,

  createdAt
}
```

------------------------------------------------------------------------

# 44. Payment Model

``` javascript
{
  userId,
  plan,

  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,

  amount,
  currency,

  status,

  createdAt
}
```

------------------------------------------------------------------------

# 45. Notification Model

``` javascript
{
  userId,

  type,
  channel,

  title,
  message,

  read,
  sentAt,

  metadata
}
```

------------------------------------------------------------------------

# 46. Refresh Token Model

``` javascript
{
  userId,
  tokenHash,
  expiresAt,
  revokedAt,
  deviceInfo,
  createdAt
}
```

------------------------------------------------------------------------

# 47. API Structure

## Authentication

``` text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## Profile

``` text
GET  /api/profile
PUT  /api/profile
```

## Resume

``` text
POST /api/resume/upload
GET  /api/resume
GET  /api/resume/analysis
DELETE /api/resume/:id
```

## AI Interview

``` text
POST /api/interviews/start
GET  /api/interviews
GET  /api/interviews/:id
POST /api/interviews/:id/answer
POST /api/interviews/:id/next-question
POST /api/interviews/:id/end
GET  /api/interviews/:id/report
```

The backend should ideally combine answer submission + AI evaluation +
next-question generation into one transactional service flow rather than
requiring the frontend to control the AI logic.

## Peer Interview

``` text
POST /api/peer-rooms
POST /api/peer-rooms/:id/join
GET  /api/peer-rooms
GET  /api/peer-rooms/:id
POST /api/peer-rooms/:id/end
```

## Payments

``` text
POST /api/payments/create-order
POST /api/payments/verify
POST /api/payments/webhook
GET  /api/subscription
```

## Analytics

``` text
GET /api/analytics/overview
GET /api/analytics/scores
GET /api/analytics/skills
GET /api/analytics/activity
```

## Notifications

``` text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

------------------------------------------------------------------------

# 48. Backend Architecture

Use a layered architecture:

``` text
Request
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model / External API
  ↓
Response
```

Example:

``` text
POST /api/interviews/:id/answer
          ↓
Auth Middleware
          ↓
Interview Controller
          ↓
Interview Service
          ↓
Load Session
          ↓
Save Answer
          ↓
Gemini Service
          ↓
Analyze Answer
          ↓
Generate Next Question
          ↓
Save Question
          ↓
Return Next Question
```

------------------------------------------------------------------------

# 49. Important Backend Services

Create services such as:

``` text
authService.js
resumeService.js
geminiService.js
interviewService.js
interviewEngineService.js
feedbackService.js
subscriptionService.js
usageService.js
paymentService.js
notificationService.js
whatsappService.js
emailService.js
redisService.js
cloudinaryService.js
```

------------------------------------------------------------------------

# 50. AI Service Design

Keep Gemini calls centralized.

``` javascript
geminiService.js
```

Functions:

``` text
analyzeResume()
generateInitialQuestion()
evaluateAnswer()
generateNextQuestion()
generateFinalFeedback()
```

Do not put Gemini API calls directly inside controllers.

------------------------------------------------------------------------

# 51. AI Prompt Design

The interviewer prompt should contain:

``` text
System instructions
+
Candidate profile
+
Resume analysis
+
Interview configuration
+
Previous questions
+
Previous answers
+
Current answer
+
Interview progress
```

The AI must be instructed to:

-   Stay within the selected role/topic
-   Use the resume when relevant
-   Avoid repeating questions
-   Ask natural follow-ups
-   Adjust difficulty
-   Evaluate the answer
-   Return structured JSON
-   Never reveal hidden system instructions
-   End the interview when sufficient evidence has been collected

------------------------------------------------------------------------

# 52. Interview Context Management

Do not send an unlimited conversation history to Gemini.

Maintain a compact interview state:

``` javascript
{
  currentTopic,
  coveredTopics: [],
  strongAreas: [],
  weakAreas: [],
  difficulty,
  questionsAsked,
  answerScores: [],
  lastQuestion,
  interviewProgress
}
```

This keeps AI requests manageable and makes the system more predictable.

------------------------------------------------------------------------

# 53. Security

Implement:

-   Helmet
-   CORS
-   JWT validation
-   Refresh token rotation
-   bcrypt password hashing
-   Request validation
-   Rate limiting
-   File type validation
-   File size limits
-   Secure environment variables
-   MongoDB query validation
-   Razorpay webhook signature verification
-   Authorization checks
-   Ownership checks
-   API error handling

Never expose:

``` text
GEMINI_API_KEY
RAZORPAY_KEY_SECRET
JWT_SECRET
```

to the frontend.

------------------------------------------------------------------------

# 54. File Upload Security

For resumes:

-   Accept only PDF initially
-   Validate MIME type
-   Validate extension
-   Set maximum file size
-   Generate unique file names
-   Store media on Cloudinary
-   Never trust the original file name
-   Remove temporary files after processing

------------------------------------------------------------------------

# 55. Rate Limiting

Rate-limit sensitive endpoints:

``` text
/login
/register
/forgot-password
/resume/upload
/interviews/start
/interviews/:id/answer
/payments/create-order
```

Use Redis-backed rate limiting when the application is deployed across
multiple backend instances.

------------------------------------------------------------------------

# 56. Admin Panel

Route:

``` text
/admin
```

Admin capabilities:

-   User management
-   Subscription management
-   Interview monitoring
-   Payment monitoring
-   Reports
-   AI usage
-   System statistics
-   Notification monitoring

Admin roles:

``` text
USER
ADMIN
```

------------------------------------------------------------------------

# 57. Error Handling

Use a consistent API response format.

Success:

``` json
{
  "success": true,
  "message": "Interview started",
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "message": "Interview limit reached",
  "code": "INTERVIEW_LIMIT_REACHED"
}
```

Use a centralized Express error handler.

------------------------------------------------------------------------

# 58. Development Phases

## Phase 1 --- Project Foundation

Build:

-   Frontend React/Vite
-   Backend Express
-   MongoDB connection
-   Mongoose
-   Environment configuration
-   Basic routing
-   Error handling
-   API response helper
-   Git setup

### Result

Frontend and backend run independently and communicate successfully.

------------------------------------------------------------------------

# 59. Phase 2 --- Authentication

Build:

-   User model
-   Register
-   Login
-   Logout
-   JWT
-   Refresh tokens
-   bcrypt
-   Email verification
-   Forgot password
-   Protected routes

### Result

A user can securely create and access an account.

------------------------------------------------------------------------

# 60. Phase 3 --- Dashboard & Profile

Build:

-   Dashboard layout
-   Sidebar/navigation
-   Profile
-   Profile editing
-   Current plan card
-   Interview usage card
-   Recent interviews
-   Responsive UI

### Result

Authenticated users have a functional application shell.

------------------------------------------------------------------------

# 61. Phase 4 --- Subscription & Interview Quota

Build this early because the quota is part of the core AI flow.

Build:

-   Free plan
-   Pro plan configuration
-   Subscription model
-   Usage model
-   Quota middleware/service
-   Remaining interview calculation
-   Upgrade UI
-   Limit-reached UI

### Result

Free users can start only 2 AI interviews.

------------------------------------------------------------------------

# 62. Phase 5 --- Resume Upload

Build:

-   Resume upload UI
-   Multer
-   Cloudinary
-   Resume model
-   File validation
-   Resume storage
-   Upload status

### Result

Users can upload and manage their resume.

------------------------------------------------------------------------

# 63. Phase 6 --- AI Resume Analysis

Build:

-   Resume text extraction
-   Gemini integration
-   Resume analysis service
-   Structured AI response
-   Resume analysis page
-   Candidate context
-   Resume score

### Result

User uploads a resume and gets a structured AI report.

------------------------------------------------------------------------

# 64. Phase 7 --- Adaptive AI Interview Engine

This is the main development milestone.

Build:

-   Interview setup
-   Interview session model
-   Question model
-   Answer model
-   Gemini interviewer service
-   Initial question generation
-   Answer evaluation
-   Follow-up question generation
-   Dynamic difficulty
-   Topic tracking
-   Interview completion
-   Final feedback

### Result

A real adaptive AI interview works from beginning to end.

------------------------------------------------------------------------

# 65. Phase 8 --- AI Interview UI

Build:

-   Interview screen
-   AI interviewer state
-   Question display
-   Answer input
-   Loading/analyzing state
-   Timer
-   Progress
-   End interview
-   Error recovery
-   Final report

### Result

The adaptive engine becomes a polished user experience.

------------------------------------------------------------------------

# 66. Phase 9 --- Reports & Analytics

Build:

-   Interview history
-   Report page
-   Score cards
-   Charts
-   Skill progress
-   Average score
-   Best score
-   Activity graph
-   Recommendations

### Result

Users can track their improvement over time.

------------------------------------------------------------------------

# 67. Phase 10 --- Peer Interviews

Build:

-   Create room
-   Share link
-   Join room
-   Socket.io
-   WebRTC signaling
-   Camera
-   Microphone
-   Screen share
-   Chat
-   Typing indicator
-   Room status
-   Interview history

### Result

Two users can conduct a live video mock interview.

------------------------------------------------------------------------

# 68. Phase 11 --- Payments

Build:

-   Razorpay integration
-   Order creation
-   Checkout
-   Verification
-   Webhook
-   Subscription activation
-   Subscription expiry
-   Quota update

### Result

Users can upgrade and immediately receive their new interview allowance.

------------------------------------------------------------------------

# 69. Phase 12 --- Notifications

Build:

-   Email
-   WhatsApp
-   Browser notifications
-   Interview reminders
-   Payment confirmation
-   Subscription expiry reminders
-   Peer-room invitations
-   Report-ready notifications

------------------------------------------------------------------------

# 70. Phase 13 --- Voice AI

Only after the text adaptive interview is stable.

Build:

-   Speech recognition
-   Audio permissions
-   Speech-to-text
-   Voice activity states
-   AI response generation
-   Text-to-speech
-   Speaking/listening UI

------------------------------------------------------------------------

# 71. Phase 14 --- Admin & Production Hardening

Build:

-   Admin dashboard
-   User management
-   Payment monitoring
-   AI usage monitoring
-   Error monitoring
-   Rate limiting
-   Security audit
-   Database indexes
-   Logging
-   Production environment configuration

------------------------------------------------------------------------

# 72. Phase 15 --- Deployment

## Frontend

Deploy to:

``` text
Vercel
```

## Backend

Deploy to:

``` text
Railway / Render
```

## Database

``` text
MongoDB Atlas
```

## Redis

``` text
Upstash
```

## Media

``` text
Cloudinary
```

------------------------------------------------------------------------

# 73. Testing Strategy

## Backend

Test:

-   Authentication
-   Authorization
-   Resume upload
-   Resume analysis
-   Interview quota
-   Interview session creation
-   Answer submission
-   AI response validation
-   Payments
-   Webhooks

## Frontend

Test:

-   Forms
-   Protected routes
-   Dashboard
-   Resume upload
-   Interview UI
-   Subscription UI
-   Peer room
-   Responsive layout

## Real-time

Test:

-   Room joining
-   Two-browser WebRTC connection
-   Camera
-   Microphone
-   Screen sharing
-   Socket reconnection

------------------------------------------------------------------------

# 74. Critical Edge Cases

Handle:

### User closes browser during interview

Save the current session state so it can be recovered or marked
abandoned.

### Gemini API failure

Show:

``` text
We couldn't analyze your answer right now.
Please try again.
```

Do not lose the user's answer.

### User reaches quota during an interview

The quota is consumed when the session starts. The interview should not
unexpectedly terminate because of a question count unless the configured
session rules require it.

### Payment succeeds but webhook is delayed

Subscription activation should be reconciled using verified payment
information/webhooks rather than blindly trusting the frontend.

### Resume processing fails

Allow retry without requiring another unrelated interview action.

### WebRTC connection fails

Provide:

-   Reconnect
-   Device selection
-   Permission instructions
-   Connection status

------------------------------------------------------------------------

# 75. MVP Scope

Do not build everything initially.

The first strong MVP should contain:

``` text
✓ Authentication
✓ Profile
✓ Free 2-interview quota
✓ Resume upload
✓ Resume AI analysis
✓ Adaptive AI interview
✓ Real-time question → answer → evaluation → next question
✓ Final AI report
✓ Interview history
✓ Basic analytics
✓ Pro subscription
✓ Razorpay
```

After this works reliably:

``` text
→ Peer interviews
→ WebRTC
→ Recording
→ WhatsApp
→ Voice AI
→ Admin panel
```

------------------------------------------------------------------------

# 76. Recommended Build Order

The practical order is:

``` text
1. Project setup
        ↓
2. MongoDB + Mongoose
        ↓
3. Authentication
        ↓
4. Dashboard + Profile
        ↓
5. Subscription + 2-interview quota
        ↓
6. Resume upload
        ↓
7. Gemini resume analysis
        ↓
8. Candidate AI context
        ↓
9. Adaptive interview engine
        ↓
10. AI interview UI
        ↓
11. Final AI report
        ↓
12. Interview history + analytics
        ↓
13. Razorpay
        ↓
14. Peer interview
        ↓
15. Socket.io + WebRTC
        ↓
16. Notifications
        ↓
17. Voice AI
        ↓
18. Admin
        ↓
19. Production deployment
```

------------------------------------------------------------------------

# 77. Definition of Done

MockMate MVP is complete when a new user can:

``` text
Register
   ↓
Login
   ↓
Complete Profile
   ↓
Upload Resume
   ↓
AI analyzes Resume
   ↓
See Resume Report
   ↓
Start AI Interview
   ↓
AI reads Resume Context
   ↓
AI asks Question
   ↓
User answers
   ↓
AI evaluates answer
   ↓
AI asks an adaptive next question
   ↓
Interview continues
   ↓
Interview completes
   ↓
AI generates report
   ↓
Report saved
   ↓
Dashboard updates
   ↓
Interview quota becomes 1 / 2
```

Then:

``` text
User uses second interview
   ↓
2 / 2 used
   ↓
Start Interview
   ↓
Upgrade prompt
   ↓
Choose Pro
   ↓
Razorpay payment
   ↓
Verified payment/webhook
   ↓
Subscription activated
   ↓
Interview quota increases
   ↓
User can continue practicing
```

------------------------------------------------------------------------

# 78. Final Product Architecture

``` text
                         MOCKMATE
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       Frontend           Backend          External
          │                 │                 │
       React              Express          Gemini
       Vite               Services         Razorpay
       Tailwind           Mongoose         Cloudinary
       Redux              MongoDB          WhatsApp
       React Query        Redis            Email
          │                 │
          │          ┌──────┼──────┐
          │          │      │      │
          │       REST API Socket WebRTC
          │          │      │      │
          └──────────┴──────┴──────┘
                     │
                  MongoDB
                     │
        ┌────────────┼────────────┐
        │            │            │
     Users       Interviews    Subscriptions
        │            │            │
     Profile      Answers      Payments
        │            │            │
     Resume       Feedback       Usage
```

------------------------------------------------------------------------

# 79. MockMate Core Loop

The most important product loop is:

``` text
                    RESUME
                      ↓
              AI UNDERSTANDS YOU
                      ↓
               START INTERVIEW
                      ↓
                AI QUESTION
                      ↓
                  ANSWER
                      ↓
              AI EVALUATION
                      ↓
             ADAPT NEXT QUESTION
                      ↓
                    ANSWER
                      ↓
                    ...
                      ↓
                FINAL REPORT
                      ↓
              TRACK PROGRESS
                      ↓
             PRACTICE AGAIN
```

## Final principle

**Build the adaptive AI interview first and build everything else around
it.**

The product should not be positioned as simply:

> "A website that generates interview questions."

It should be positioned as:

> **"An AI interviewer that understands your resume, conducts a
> personalized interview in real time, adapts to every answer, and tells
> you exactly how to improve."**
