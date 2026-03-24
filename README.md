# Placement Oracle

Placement Oracle is a full-stack placement readiness platform for students built with:

- `client/` -> Next.js + Tailwind CSS frontend
- `server/` -> Spring Boot + Maven backend

It includes authentication, profile analysis, GitHub integration, resume parsing, company prediction, safe company mode, interview practice, admin tools, and dark/light mode support.

## Tech Stack

### Frontend

- Next.js
- Tailwind CSS
- Axios
- Framer Motion
- Recharts
- jsPDF
- lucide-react

### Backend

- Spring Boot
- Spring Security
- JWT
- Spring Data MongoDB
- BCrypt password hashing
- Apache Tika for resume parsing

## Final Structure

```text
placement-oracle/
|-- client/
|   |-- app/
|   |   |-- admin/
|   |   |-- dashboard/
|   |   |-- interview/
|   |   |-- login/
|   |   |-- profile/
|   |   |-- signup/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |-- lib/
|   |-- package.json
|   `-- tailwind.config.ts
|-- server/
|   |-- src/main/java/com/placementoracle/server/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- exception/
|   |   |-- model/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   |-- src/main/resources/application.properties
|   `-- pom.xml
`-- README.md
```

## Core Features

- User signup and login with JWT authentication
- Default admin account
- Profile creation with resume upload
- GitHub profile stats fetch
- Placement score calculation
- Dream company and safe company suggestions
- Target-based analysis
- Resume parsing and skill-gap detection
- Dashboard with roadmap, resume tips, skill tags, and PDF export
- Chat interview feedback
- Voice interview feedback
- Admin dashboard for user management
- Dark mode and light mode toggle

## Authentication

### User Signup

Endpoint:

```http
POST /api/auth/signup
```

Response:

```json
{
  "message": "Signup successful",
  "token": "...",
  "userId": "...",
  "email": "user@example.com",
  "role": "USER"
}
```

### User Login

Endpoint:

```http
POST /api/auth/login
```

Response:

```json
{
  "message": "Login successful",
  "token": "...",
  "userId": "...",
  "email": "user@example.com",
  "role": "USER"
}
```

### Default Admin

- Email: `admin@placement.com`
- Password: `admin123`

## Quick Start

This project has two separate apps:

- `server/` = Spring Boot backend -> use `mvn`
- `client/` = Next.js frontend -> use `npm`

Important:

- Do not run `npm install` inside `server/`
- Do not run `mvn spring-boot:run` inside `client/`

## Run Locally

### 1. Start Backend

```bash
cd server
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### 2. Start Frontend

```bash
cd client
npm install
cd client
```

Frontend runs on:

```text
http://localhost:3000
```

## Main URLs

### Frontend Pages

- Home: `http://localhost:3000`
- Signup: `http://localhost:3000/signup`
- Login: `http://localhost:3000/login`
- Profile: `http://localhost:3000/profile`
- Dashboard: `http://localhost:3000/dashboard`
- Interview: `http://localhost:3000/interview`
- Admin: `http://localhost:3000/admin`

### Backend APIs

- Health: `GET /api/health`
- Signup: `POST /api/auth/signup`
- Login: `POST /api/auth/login`
- Save profile: `POST /api/profile`
- Current profile: `GET /api/profile/me`
- Profile by ID: `GET /api/profile/{id}`
- GitHub stats: `GET /api/github/{username}`
- Analyze profile: `POST /api/analyze`
- Chat feedback: `POST /api/chat`
- Voice feedback: `POST /api/voice`
- Admin users: `GET /api/admin/users`
- Delete user: `DELETE /api/admin/users/{id}`
- Reset users: `DELETE /api/admin/reset`

## Environment Notes

### Backend

Defaults from `server/src/main/resources/application.properties`:

- Port: `8080`
- MongoDB URI:
  - `mongodb://localhost:27017/placement_oracle`
- CORS allowed origins:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`

Optional environment variables:

- `MONGODB_URI`
- `APP_CORS_ALLOWED_ORIGINS`

### Frontend

Optional environment variable:

- `NEXT_PUBLIC_API_BASE_URL`

If not set, the frontend uses:

```text
http://localhost:8080
```

## Common Mistake

If you see:

```text
npm ERR! enoent Could not read package.json ... server/package.json
```

you ran `npm install` inside `server/`.

Use:

```bash
cd D:\PROJECTS\placement-oracle\server
mvn spring-boot:run
```

and:

```bash
cd D:\PROJECTS\placement-oracle\client
npm install
npm run dev
```

## Notes

- MongoDB is supported, but the backend also has an in-memory fallback for some local development flows if MongoDB is unavailable.
- Resume parsing uses Apache Tika.
- Voice interview works best in Chromium-based browsers because it depends on the Web Speech API.
- Theme preference is saved in `localStorage`.
- Protected frontend flows depend on JWT returned from login/signup.

## Final Status

The project currently supports:

- working signup
- working login
- protected dashboard/profile flow
- GitHub fetch
- analysis API
- chatbot
- voice interview
- resume parsing
- admin management
- dark mode and light mode
