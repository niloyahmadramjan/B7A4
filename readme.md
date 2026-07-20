# FixItNow API

A backend service for a home-services / on-demand technician booking platform. Customers can browse services and technicians, book appointments, pay online, and leave reviews. Technicians manage their availability and bookings, and admins oversee users, bookings, and categories.

Built with **Node.js, Express, TypeScript, PostgreSQL (Prisma ORM), JWT auth, and Stripe** for payments.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [API Endpoints Summary](#api-endpoints-summary)
- [Error Response Format](#error-response-format)
- [Payment Flow](#payment-flow)
- [Admin Access](#admin-access)
- [Deployment](#deployment)
- [Submission Links](#submission-links)

---

## Overview

FixItNow connects customers who need home repair/maintenance work with skilled technicians. The API supports:

- Role-based registration & authentication (Customer, Technician, Admin)
- Service & category browsing with search/filter support
- Technician profiles, availability scheduling, and ratings
- Booking lifecycle management (request → accept → in-progress → complete/cancel)
- Reviews & ratings after a completed booking
- Online payments via **Stripe**, with payment status tracking
- Admin controls for managing users, bookings, and categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma (with `@prisma/adapter-pg`) |
| Auth | JWT (access + refresh tokens), bcryptjs for password hashing |
| Payments | Stripe |
| Dev tooling | tsx (dev watch), TypeScript compiler (build) |

Key dependencies: `express`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `dotenv`, `http-status`, `stripe`.

---

## User Roles

Each account is assigned one of three fixed roles at registration:

| Role | Capabilities |
|---|---|
| **CUSTOMER** | Browse services/technicians, create bookings, pay for bookings, leave reviews, cancel bookings |
| **TECHNICIAN** | Manage profile & bio, set weekly availability, view/update assigned bookings' status |
| **ADMIN** | View/manage all users (ban/unban), view all bookings, manage service categories |

---

## Project Structure

```
fixitnow-api/
├── src/
│   ├── server.ts              # App entry point
│   ├── app.ts                 # Express app setup (middleware, routes)
│   ├── config/                # Env config, Prisma client setup
│   ├── modules/
│   │   ├── auth/              # Register, login, refresh-token, me
│   │   ├── service/            # Service CRUD & filtering
│   │   ├── category/          # Category CRUD
│   │   ├── technician/        # Technician profile, availability, bookings
│   │   ├── booking/           # Customer bookings, reviews, cancellation
│   │   ├── payment/            # Stripe payment intents & history
│   │   └── admin/             # User & booking management
│   ├── middlewares/            # auth guard, role guard, error handler, validators
│   └── utils/                  # helpers (JWT signing, response formatter, etc.)
├── prisma/
│   ├── schema.prisma            # Data models & relations
│   ├── migrations/              # Migration history
│   └── seed.ts                  # Seed script (admin user, sample categories, etc.)
├── .env                        # Environment variables (not committed)
├── package.json
├── tsconfig.json
└── README.md
```

> Adjust folder names above to match your actual repo layout if it differs.

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm (or yarn/pnpm)
- PostgreSQL database (local or hosted, e.g. Neon/Supabase/Railway)
- A Stripe account (test mode keys are sufficient for development)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/niloyahmadramjan/B7A4
cd b7-a4

# 2. Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"

# JWT
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Client (if applicable)
CLIENT_URL=http://localhost:3000
```

> Replace all placeholder values with your own credentials. Never commit `.env` to version control.

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables based on schema.prisma)
npx prisma migrate dev --name init

# (Optional) Seed the database with an admin user and sample data
npx prisma db seed
```

### Running the Project

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production build
npm run build
npm start
```

The API will be available at `http://localhost:5000` (or whichever `PORT` you set).

---

## API Documentation

Full request/response details, sample payloads, and headers are available in the Postman collection:

**Postman Collection:** https://www.postman.com/niloyahmadramjanteams/workspace/l2b7/collection/48383402-7bb5d444-d005-4457-808f-28021aae8a5d?action=share&source=copy-link&creator=48383402

To use it:
1. Import the collection into Postman.
2. Set a collection/environment variable `baseUrl` to your local (`http://localhost:5000`) or deployed API URL.
3. Register/login to obtain a JWT, then set it as the `Authorization` header (`json_web_token` variable) for protected routes.

---

## API Endpoints Summary

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register as Customer, Technician, or Admin |
| POST | `/api/auth/login` | Login and receive access/refresh tokens |
| POST | `/api/auth/refresh-token` | Get a new access token |
| GET | `/api/auth/me` | Get the currently logged-in user |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories (supports `name` filter) |
| POST | `/api/categories` | Create a category (Admin) |

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/services` | List services (filter by title, price, rating, location, category, minPrice) |
| POST | `/api/services` | Create a service |

### Technicians
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/technician` | List technicians (filter/sort by price, category, rating) |
| GET | `/api/technician/:id` | Get technician profile with reviews |
| PUT | `/api/technician/:id` | Update technician profile |
| GET | `/api/technician/bookings` | Get technician's assigned bookings |
| PATCH | `/api/technician/bookings/:id` | Update booking status (ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, etc.) |
| PUT | `/api/technician/availability` | Set weekly availability slots |

### Bookings (Customer)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking for a service |
| GET | `/api/bookings` | Get logged-in customer's bookings |
| GET | `/api/bookings/:id` | Get a single booking's details |
| PATCH | `/api/bookings/cancel/:id` | Cancel a booking |
| POST | `/api/reviews` | Leave a review for a completed booking |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create` | Create a payment session/intent for a booking |
| GET | `/api/payments/:id` | Get details of a specific payment |
| GET | `/api/payments` | Get payment history |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users (filter by name, email, status) |
| PUT | `/api/admin/users/:id` | Ban/unban a user |
| GET | `/api/admin/bookings` | View all bookings (filter by status, name) |
| GET | `/api/categories` | View categories |
| POST | `/api/categories` | Create a category |

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorDetails": {}
}
```

This applies to validation errors, authentication/authorization failures, not-found errors, and unhandled server errors, handled centrally via a global error-handling middleware.

---

## Payment Flow

1. Customer creates a booking (`POST /api/bookings`).
2. Once the technician accepts, the customer creates a payment session (`POST /api/payments/create`) with the `bookingId`.
3. Stripe processes the payment; on success, the booking status is updated to `PAID`.
4. Payment status and history can be checked via `GET /api/payments/:id` and `GET /api/payments`.

> Cash on delivery / pay-later is **not** supported — all payments are processed through Stripe.

---

## Admin Access

```
Admin Email    : admin@gmail.com
Admin Password : admin@gmail.com

```

---

## Deployment

- **Backend Repo:** https://github.com/niloyahmadramjan/B7A4

- **Hosting:** Vercel (Node.js + PostgreSQL)

Make sure to set all environment variables (`DATABASE_URL`, JWT secrets, Stripe keys, etc.) in your hosting provider's dashboard before deploying.

---

## Submission Links

| Item | Link |
|---|---|
| Backend GitHub Repo | https://github.com/niloyahmadramjan/B7A4 |
| Live API | https://fixitnow-b7a4.vercel.app |
| API Docs (Postman) | https://www.postman.com/niloyahmadramjanteams/l2b7/collection/eei7suc/fixitnow?action=share&source=copy-link&creator=48383402|
| Demo Video | https://drive.google.com/file/d/xxx/view |
| Admin Email | admin@gmail.com |
| Admin Password | admin@gmail.com|

---

Built as part of a backend assignment project, demonstrating role-based authentication, RESTful API design, database modeling with Prisma, structured error handling, and Stripe payment integration.