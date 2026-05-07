# 🎫 Ticket System API

A RESTful API for managing support tickets, built with NestJS. Designed as a portfolio project to demonstrate backend development skills including authentication, authorization, and clean architecture.

---

## 🚀 Technologies

- **[NestJS](https://nestjs.com/)** — Node.js framework
- **[TypeORM](https://typeorm.io/)** — ORM for database management
- **[PostgreSQL](https://www.postgresql.org/)** — Relational database
- **[Docker](https://www.docker.com/)** — Container for local database
- **[JWT](https://jwt.io/)** — Authentication with access and refresh tokens
- **[Zod](https://zod.dev/)** — Environment variable validation
- **[Swagger](https://swagger.io/)** — API documentation
- **[bcrypt](https://www.npmjs.com/package/bcryptjs)** — Password hashing

---

## ✨ Features

- **Authentication** — Register, login, and JWT refresh token flow
- **Role-based access control (RBAC)** — `Admin`, `Agent`, and `User` roles
- **Users** — Full CRUD with role-based authorization
- **Tickets** — Create and manage support tickets with status, priority, and category
- **Comments** — Comment thread on each ticket
- **Global validation** — Request validation with `class-validator`
- **Environment validation** — Startup validation with Zod

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) and Docker Compose

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vcezar-dev/ticket-system-api.git
cd ticket-system-api
```

### 2. Configure environment variables

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

Fill in both files with your values. See the [Environment Variables](#-environment-variables) section for details.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the database

```bash
docker compose up -d
```

### 5. Start the application

```bash
npm run start:dev
```

### 6. Run migrations

```bash
npm run migration:run
```

### 7. Access the API documentation

```
http://localhost:3000/docs
```

---

## 🌱 Environment Variables

This project uses two separate environment files:

- **`.env`** — Application configuration (NestJS)
- **`.env.docker`** — Docker infrastructure configuration

### `.env`

```bash
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_DATABASE=ticket_system
DATABASE_PASSWORD=your_database_password
DATABASE_LOGGING=false

# JWT
JWT_SECRET=your_jwt_secret
JWT_AUDIENCE=http://localhost:3000
JWT_ISSUER=http://localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=604800

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
```

### `.env.docker`

```bash
# PostgreSQL Container
CONTAINER_NAME=ticket-system-api-postgres
POSTGRES_DB=ticket_system
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5432

# PostgreSQL Test Container
TEST_CONTAINER_NAME=ticket-system-api-postgres-test
TEST_POSTGRES_DB=ticket_system_test
TEST_POSTGRES_USER=postgres
TEST_POSTGRES_PASSWORD=postgres
TEST_POSTGRES_PORT=5436
```

---

## 🗂️ Project Structure

```
src/
├── auth/                   # Authentication module (login, refresh token, guards)
│   ├── decorators/         # @Public(), @ActiveUser(), Swagger decorators
│   ├── dto/                # SignInDto, RefreshTokenDto, TokenPayloadDto
│   └── guards/             # AccessTokenGuard, RefreshTokenGuard, RolesGuard
├── comments/               # Comments module
├── common/                 # Shared resources
│   ├── dto/                # ResponseUserSummaryDto
│   └── hashing/            # HashingService, BcryptService
├── config/                 # App configuration (database, jwt, env validation)
├── database/               # DatabaseModule, DataSource, migrations
├── tickets/                # Tickets module
└── users/                  # Users module
```

---

## 🔐 Authentication

The API uses JWT with two tokens:

| Token | TTL | Usage |
|-------|-----|-------|
| Access Token | 1 hour | Sent in `Authorization: Bearer <token>` header |
| Refresh Token | 7 days | Sent in request body to `POST /auth/refresh` |

All routes are protected by default. Use `@Public()` to mark public routes.

---

## 👥 Roles

| Role | Permissions |
|------|-------------|
| `Admin` | Full access |
| `Agent` | Manage tickets, view users |
| `User` | Create tickets, view own tickets and comments |

---

## 📜 Available Scripts

```bash
# Application
npm run start:dev          # Start application in watch mode
npm run build              # Build the application

# Migrations
npm run migration:generate # Generate a new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Tests
npm run test               # Unit tests
npm run test:cov           # Unit tests with coverage
npm run test:e2e           # E2E tests (CI — requires external database)
npm run test:e2e:local     # E2E tests (local — starts test container automatically)
```

> **Infrastructure** (Docker) is managed directly via terminal, not through npm scripts:
> ```bash
> docker compose up -d    # Start database
> docker compose down     # Stop database
> ```

---

## 🌱 Seed

To populate the database with sample data (users, tickets and comments):

```bash
npm run seed
```

To clear all seed data:

```bash
npm run seed:clear
```

### Default credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketsystem.com | Admin@1234 |
| Agent | agent@ticketsystem.com | Agent@1234 |
| User | john@ticketsystem.com | User@1234 |

---

## 🧪 Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests (local — starts and stops the test container automatically)
npm run test:e2e:local

# E2E tests (CI — database provided externally)
npm run test:e2e
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).