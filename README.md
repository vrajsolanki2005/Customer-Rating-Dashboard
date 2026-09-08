# Store Rating Platform

A full-stack web application that lets customers discover stores and submit ratings, while giving store owners and administrators the tools to manage their data. Built with React on the frontend and Node.js with Express on the backend, backed by a PostgreSQL database through Prisma.

---

## What it does

The platform supports three types of users, each with their own experience.

Administrators can see a dashboard with platform-wide statistics, manage all users and stores, create new accounts with any role, and edit or delete existing records.

Store owners log in to a personal dashboard that shows all the stores assigned to them, the ratings customers have left, and the overall average score. They can also update their store details directly from the dashboard.

Regular users browse the full list of stores, search and filter by name or address, and submit a rating between 1 and 5 stars. They can come back later and update their rating if they change their mind.

---

## Tech stack

**Frontend**
- React 18 with Vite
- React Router for client-side routing
- Axios for API requests
- Tailwind CSS for styling
- Zod and React Hook Form for form validation
- Lucide React for icons

**Backend**
- Node.js with Express
- Prisma ORM with PostgreSQL
- JSON Web Tokens for authentication
- bcryptjs for password hashing
- Zod for request validation

**Testing**
- Jest with Supertest for API integration tests

---

## Project structure

```
store-rating-platform/
  client/          React frontend
  server/          Express backend
    prisma/        Database schema, migrations, seed
    src/
      config/      Database connection
      controllers/ Route handlers
      middleware/  Auth, role, validation
      routes/      API route definitions
      utils/       JWT helpers
      validators/  Zod schemas
    tests/         Integration tests
```

---

## Prerequisites

- Node.js 18 or higher
- A PostgreSQL database (local or hosted, such as Supabase)

---

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd store-rating-platform
```

### 2. Set up the backend

```bash
cd server
npm install
```

Copy the example environment file and fill in your values.

```bash
cp .env.example .env
```

Your `.env` file should look like this:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
PORT=5000
JWT_SECRET="your_secret_key"
CLIENT_URL="http://localhost:5173"
```

Run the database migrations to create the tables:

```bash
npx prisma migrate deploy
```

Seed the database with an admin account, a store owner, a regular user, and a few sample stores:

```bash
node prisma/seed.js
```

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Set up the frontend

Open a new terminal window.

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Default accounts

After running the seed script, you can log in with these credentials.

| Role        | Email                  | Password    |
|-------------|------------------------|-------------|
| Admin       | admin@example.com      | Admin@123   |
| Store owner | owner@example.com      | Owner@123   |
| User        | user@example.com       | User@1234   |

---

## API overview

All routes are prefixed with `/api`.

**Authentication** — `/api/auth`

| Method | Path              | Description                  | Auth required |
|--------|-------------------|------------------------------|---------------|
| POST   | /signup           | Register a new user          | No            |
| POST   | /login            | Log in and receive a token   | No            |
| GET    | /me               | Get the current user         | Yes           |
| PATCH  | /password         | Change password              | Yes           |
| POST   | /logout           | Log out                      | Yes           |

**Admin** — `/api/admin` (ADMIN role only)

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | /dashboard        | Platform statistics          |
| GET    | /users            | List users with filters      |
| GET    | /users/:id        | User details                 |
| POST   | /users            | Create a user                |
| PATCH  | /users/:id        | Update a user                |
| DELETE | /users/:id        | Delete a user                |
| GET    | /stores           | List stores with filters     |
| POST   | /stores           | Create a store               |
| PATCH  | /stores/:id       | Update a store               |
| DELETE | /stores/:id       | Delete a store               |

**User** — `/api/user` (USER role only)

| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /stores                     | Browse stores            |
| POST   | /stores/:storeId/rating     | Submit a rating          |
| PUT    | /stores/:storeId/rating     | Update a rating          |

**Owner** — `/api/owner` (STORE_OWNER role only)

| Method | Path              | Description                        |
|--------|-------------------|------------------------------------|
| GET    | /dashboard        | Stores and customer ratings        |
| PATCH  | /stores/:id       | Update an owned store              |

---

## Password rules

Passwords must be between 8 and 16 characters, contain at least one uppercase letter, and include at least one special character.

---

## Running tests

The test suite runs against your main database. Make sure the server environment variables are configured before running tests.

```bash
cd server
npm test
```

To run tests in watch mode during development:

```bash
npm run test:watch
```

The tests cover all authentication flows, admin user and store management, user store browsing and rating submission, and the store owner dashboard.

---

## Available scripts

**Server**

| Script               | Description                          |
|----------------------|--------------------------------------|
| npm run dev          | Start with nodemon (auto-reload)     |
| npm start            | Start in production mode             |
| npm test             | Run the full test suite              |
| npm run test:watch   | Run tests in watch mode              |
| npm run prisma:migrate | Run database migrations            |
| npm run prisma:generate | Regenerate Prisma client          |
| npm run prisma:studio | Open Prisma Studio                  |

**Client**

| Script        | Description                    |
|---------------|--------------------------------|
| npm run dev   | Start the Vite dev server      |
| npm run build | Build for production           |
| npm run preview | Preview the production build |

---

## Health check

Once the server is running, you can verify it is up by visiting:

```
GET http://localhost:5000/api/health
```

It will return a simple JSON response confirming the server is running.
