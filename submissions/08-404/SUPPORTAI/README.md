# Smart Complaint Management System

Production-style hackathon project for AI-powered customer complaint resolution with:

- Next.js 14 frontend
- Tailwind CSS premium UI
- Express + MongoDB backend
- JWT authentication
- Socket.io realtime updates
- OpenAI-based complaint triage with safe fallback logic
- Multilingual complaint handling
- Voice input and voice output

## What This Project Includes

### Frontend

- Amazon-style orders page
- Floating AI chatbot widget
- Voice-enabled complaint input
- Learning mode for bilingual answers
- Incident analysis timeline UI
- Agent dashboard for live ticket operations

### Backend

- User registration and login with JWT
- Chat analysis endpoint
- Automatic severity and category classification
- Automatic unresolved ticket creation
- Ticket assignment and resolution APIs
- Socket.io notifications for new and updated tickets

## Project Structure

```text
SUPPORTAI/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- hooks/
|   |-- services/
|   |-- utils/
|   |-- .env.local.example
|   `-- package.json
|-- package.json
`-- README.md
```

## Main Features

- AI chatbot for first-level support
- Severity classification: `LOW`, `MEDIUM`, `HIGH`
- Category classification: `Billing`, `Technical`, `Delivery`
- Auto-ticketing when the issue is unresolved
- Ticket transcript storage in MongoDB
- Agent dashboard with filters and actions
- Festival-aware response adjustments for keywords like `Diwali` and `Pongal`
- Language handling for `English`, `Hindi`, `Tamil`, and `Tanglish`
- Accessibility support using browser speech APIs

## Tech Stack

### Frontend

- `Next.js 14`
- `React 18`
- `Tailwind CSS`
- `Framer Motion`
- `socket.io-client`
- `lucide-react`

### Backend

- `Node.js`
- `Express`
- `MongoDB`
- `Mongoose`
- `JWT`
- `Socket.io`
- `OpenAI SDK`

## Environment Setup

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Create environment files

On Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.local.example frontend\.env.local
```

### 3. Backend environment

Update [backend/.env.example](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/.env.example) values in your local `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/supportai
JWT_SECRET=super-secret-change-me
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### 4. Frontend environment

Update [frontend/.env.local.example](C:/Users/ASUS/Documents/SUPPORTAI/frontend/.env.local.example) values in your local `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## How To Run

### Run both frontend and backend

```bash
npm run dev
```

### Run only backend

```bash
npm run dev:backend
```

### Run only frontend

```bash
npm run dev:frontend
```

### Production build for frontend

```bash
npm run build --workspace frontend
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Backend health check: `http://localhost:5000/api/health`
- Agent dashboard: `http://localhost:3000/dashboard`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Chat

- `POST /api/chat/message`

### Tickets

- `POST /api/tickets/create`
- `GET /api/tickets`
- `PATCH /api/tickets/:ticketId/assign`
- `PATCH /api/tickets/:ticketId/resolve`

## Example Agent Registration Payload

Use this to create an agent account before logging into the dashboard:

```json
{
  "name": "Support Agent",
  "email": "agent@example.com",
  "password": "password123",
  "languagePreference": "English",
  "role": "agent"
}
```

## What Was Verified In This Workspace

The following commands were executed successfully during setup:

```bash
node -v
npm -v
npm install
node --check backend/src/server.js
node --check backend/src/app.js
npm run build --workspace frontend
```

### Verified status

- Frontend build completed successfully
- Backend source passed syntax checks
- Dependencies installed successfully

### Not fully verified yet

- Live backend runtime was not fully started because MongoDB was not running on `127.0.0.1:27017`

## Important Runtime Note

The backend requires MongoDB before `backend/src/server.js` can start successfully.

You have two options:

1. Start a local MongoDB server on `127.0.0.1:27017`
2. Replace `MONGODB_URI` in `backend/.env` with your MongoDB Atlas connection string

## AI Behavior

### With OpenAI API key

- Uses OpenAI for structured complaint analysis
- Requests strict JSON output
- Returns:

```json
{
  "response": "string",
  "category": "Billing | Technical | Delivery",
  "severity": "LOW | MEDIUM | HIGH",
  "resolved": true,
  "language": "English | Hindi | Tamil | Tanglish"
}
```

### Without OpenAI API key

- Uses fallback rules-based language detection
- Uses fallback severity and category detection
- Still supports end-to-end ticket generation

## Frontend Pages

- [frontend/app/page.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/frontend/app/page.js): orders page and chatbot launcher
- [frontend/components/ChatWidget.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/frontend/components/ChatWidget.js): floating AI support widget
- [frontend/app/dashboard/page.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/frontend/app/dashboard/page.js): dashboard route
- [frontend/components/DashboardClient.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/frontend/components/DashboardClient.js): agent dashboard UI

## Backend Core Files

- [backend/src/server.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/src/server.js): app bootstrap and Socket.io server
- [backend/src/app.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/src/app.js): Express app setup
- [backend/src/services/aiService.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/src/services/aiService.js): AI triage logic
- [backend/src/controllers/chatController.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/src/controllers/chatController.js): chat-to-ticket flow
- [backend/src/controllers/ticketController.js](/c:/Users/ASUS/Downloads/SUPPORTAI/SUPPORTAI/backend/src/controllers/ticketController.js): ticket management

## Known Notes

- Browser voice features depend on client browser support for Speech Recognition and Speech Synthesis APIs
- The chatbot UI works without login, but dashboard ticket access requires an agent account
- Ticket listing, assignment, and resolution are protected by JWT auth
- `npm install` reported 1 high severity dependency vulnerability, so run `npm audit` before deployment

## Next Recommended Steps

1. Start MongoDB or add a MongoDB Atlas URI
2. Create `backend/.env` and `frontend/.env.local`
3. Register an agent user
4. Run `npm run dev`
5. Test complaint escalation from the orders page to the agent dashboard
