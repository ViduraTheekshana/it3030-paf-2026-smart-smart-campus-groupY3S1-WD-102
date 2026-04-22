# SmartCampus

A full-stack campus resource management and incident ticketing system. SmartCampus enables students and staff to book campus resources, report incidents, track ticket progress, and receive real-time notifications — all through a modern web interface.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Recharts, Framer Motion |
| Backend | Spring Boot 4, Java 25, Spring Security, Spring Mail |
| Database | PostgreSQL 17, Flyway (migrations) |
| Auth | JWT (HTTP-only cookies), Firebase Authentication |
| DevOps | Docker Compose, GitHub Actions |

---

## Features

- **Authentication** — Email/password and Firebase login, JWT sessions, OTP-based password reset, role-based access (User / Admin)
- **Resource Management** — Create and manage campus resources (labs, rooms, equipment) with availability scheduling and image uploads
- **Booking System** — Book resources with approval workflow; admins can approve or reject with reasons
- **Incident Ticketing** — Submit tickets with file attachments, priority levels, and category tagging; track status through OPEN → IN_PROGRESS → RESOLVED → CLOSED
- **SLA Tracking** — First-response and resolution time monitoring with breach detection and health summaries
- **Notifications** — Event-driven notifications for booking/ticket status changes and new comments
- **Dashboards** — User and admin dashboards with incident statistics and resource availability overviews

---

## Project Structure

```
code/
├── client/          # React frontend (Vite)
├── server/          # Spring Boot backend
│   ├── compose.yaml # Docker Compose for PostgreSQL
│   └── .env.sample  # Environment variable template
└── .github/         # GitHub Actions workflows
```

---

## Prerequisites

- Java 25+
- Maven 3.9+
- Node.js 18+
- Docker and Docker Compose

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd code
```

### 2. Configure environment variables

```bash
cp server/.env.sample server/.env
```

Edit `server/.env` and fill in the required values:

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWTs |
| `MAIL_USERNAME` | Gmail address for sending emails |
| `MAIL_PASSWORD` | Gmail app password |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |

### 3. Start the database

```bash
cd server
docker compose up -d
```

This starts PostgreSQL 17 on port `5431`. Flyway will automatically apply all migrations on first run.

### 4. Start the backend

```bash
# From the server/ directory
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 5. Start the frontend

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Development

### Backend

```bash
cd server

# Run with hot reload
./mvnw spring-boot:run

# Build JAR
./mvnw clean package

# Run tests
./mvnw test

# Checkstyle validation
./mvnw checkstyle:check

# OWASP dependency vulnerability scan
./mvnw verify
```

### Frontend

```bash
cd client

npm run dev       # Development server with HMR
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

---

## Database Migrations

Flyway manages the schema automatically. Migration files are located at:

```
server/src/main/resources/db/migration/
```

Migrations run automatically on startup. Do not modify existing migration files — add new versioned files (`V13__description.sql`, etc.) for schema changes.

---

## API Overview

| Area | Base Path |
|------|-----------|
| Authentication | `/api/auth` |
| Users | `/api/users` |
| Resources | `/api/resources` |
| Bookings | `/api/bookings` |
| Incidents / Tickets | `/api/tickets` |
| Notifications | `/api/notifications` |

All endpoints (except `/api/auth/**`) require a valid JWT delivered via HTTP-only cookie.

---

## Roles

| Role | Access |
|------|--------|
| `ROLE_USER` | Submit tickets, create bookings, manage own data |
| `ROLE_ADMIN` | Full access — manage resources, approve bookings, assign and resolve tickets, view SLA dashboards |

---

## Contributing

1. Create a feature branch from `main`: `git checkout -b feature/<your-feature>`
2. Follow the existing code style (Checkstyle is enforced on build)
3. Open a pull request targeting `main`
