# VenueBook — Intelligent Venue Booking & Scheduling System

> **MSc IT with Project Management — University of the West of Scotland**  
> Student: Kul Prasad Ghimire | Banner ID: B01821142  
> Supervisor: Nuzhat Younis | Moderator: Mubashir Ali

---

## Project Overview

VenueBook is a full-stack intelligent web application for venue booking and scheduling. It incorporates:

- **Real-time availability management** with automated conflict detection
- **ML-inspired recommendation engine** scoring venues against user preferences and history
- **Smart waitlisting** — automatically promotes users when slots open
- **Demand forecasting** — predicts peak booking periods
- **Role-based access** for Users, Venue Owners, and Admins
- **Responsive design** that works on all screen sizes

---

## Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Frontend     | React 18, React Router v6, Recharts |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB + Mongoose ODM              |
| Auth         | JWT (JSON Web Tokens) + bcryptjs    |
| Styling      | CSS Modules + Google Fonts          |
| Dev Tools    | Nodemon, Concurrently               |

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool       | Version  | Download                          |
|-----------|----------|-----------------------------------|
| Node.js   | ≥ 18.x   | https://nodejs.org                |
| npm       | ≥ 9.x    | (comes with Node.js)              |
| MongoDB   | ≥ 6.x    | https://www.mongodb.com/try/download/community |
| Git       | any      | https://git-scm.com               |

---

## Quick Start (5 minutes)

### Step 1 — Install dependencies

```bash
# From the project root (venue-booking/)
npm install
npm run install:all
```

This installs root tools plus all backend and frontend packages.

### Step 2 — Configure environment variables

```bash
# Copy the example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then open `backend/.env` and edit:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/venue_booking
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **Important:** Change `JWT_SECRET` to any long random string before deploying.

### Step 3 — Start MongoDB

**On macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**On Ubuntu/Debian:**
```bash
sudo systemctl start mongod
```

**On Windows:**
Start MongoDB from Services, or run:
```powershell
net start MongoDB
```

**Using MongoDB Atlas (cloud — optional):**
1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string
3. Replace `MONGODB_URI` in `backend/.env` with the Atlas URI

### Step 4 — Seed the database

```bash
npm run seed
```

This creates demo venues, users, and sample bookings.

**Demo accounts created:**

| Role         | Email                    | Password     |
|-------------|--------------------------|--------------|
| Admin        | admin@venuebook.com      | password123  |
| Venue Owner  | sarah@venuebook.com      | password123  |
| Venue Owner  | james@venuebook.com      | password123  |
| User         | kul@example.com          | password123  |
| User         | emily@example.com        | password123  |

### Step 5 — Start the application

```bash
npm run dev
```

This starts both servers simultaneously:
- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:3000

Open http://localhost:3000 in your browser.

---

## Available Scripts

Run from the **project root** (`venue-booking/`):

| Command               | Description                                   |
|----------------------|-----------------------------------------------|
| `npm run dev`         | Start frontend + backend concurrently         |
| `npm run dev:backend` | Start backend only (port 5000)                |
| `npm run dev:frontend`| Start frontend only (port 3000)               |
| `npm run seed`        | Seed the database with demo data              |
| `npm run build`       | Build frontend for production                 |
| `npm run install:all` | Install all dependencies (backend + frontend) |

---

## Project Structure

```
venue-booking/
├── package.json                  # Root scripts (concurrently)
├── README.md
│
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── server.js                 # Express app entry point
│   │
│   ├── config/
│   │   └── seed.js               # Database seeder
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT protect + role authorise
│   │
│   ├── models/
│   │   ├── User.js               # User schema (roles: user/venue_owner/admin)
│   │   ├── Venue.js              # Venue schema with availability slots
│   │   └── Booking.js            # Booking schema with waitlist support
│   │
│   ├── controllers/
│   │   ├── authController.js     # register, login, getMe, updateProfile
│   │   ├── venueController.js    # CRUD + availability check
│   │   ├── bookingController.js  # create, cancel, waitlist promotion
│   │   ├── recommendationController.js  # ML scoring + demand forecast
│   │   └── analyticsController.js       # Stats, trends, category data
│   │
│   └── routes/
│       ├── auth.js
│       ├── venues.js
│       ├── bookings.js
│       ├── users.js
│       ├── recommendations.js
│       └── analytics.js
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── index.js              # React entry point
        ├── index.css             # Global design system (CSS variables)
        ├── App.js                # Router + protected routes
        │
        ├── context/
        │   └── AuthContext.js    # Global auth state
        │
        ├── utils/
        │   └── api.js            # Axios instance + interceptors
        │
        ├── components/
        │   ├── Navbar.js / .module.css
        │   ├── Footer.js / .module.css
        │   └── VenueCard.js / .module.css
        │
        └── pages/
            ├── HomePage.js           # Hero, categories, featured venues
            ├── VenuesPage.js         # Browse + filter venues
            ├── VenueDetailPage.js    # Venue info, availability, booking CTA
            ├── BookingPage.js        # Booking form with price calc
            ├── DashboardPage.js      # Stats + charts per role
            ├── MyBookingsPage.js     # User's bookings with cancel
            ├── RecommendationsPage.js # ML recommendations + demand forecast
            ├── AddVenuePage.js       # Venue owner: create listing
            ├── AuthPages.js          # Login + Register forms
            └── NotFoundPage.js
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint          | Auth | Description              |
|--------|-------------------|------|--------------------------|
| POST   | /auth/register    | No   | Register new user        |
| POST   | /auth/login       | No   | Login, returns JWT token |
| GET    | /auth/me          | Yes  | Get current user         |
| PUT    | /auth/profile     | Yes  | Update profile           |

### Venues
| Method | Endpoint                      | Auth           | Description                      |
|--------|-------------------------------|----------------|----------------------------------|
| GET    | /venues                       | No             | List venues (with filters)       |
| GET    | /venues/:id                   | No             | Get single venue                 |
| GET    | /venues/:id/availability      | No             | Get slot availability for a date |
| GET    | /venues/my-venues             | Owner/Admin    | Get owner's venues               |
| POST   | /venues                       | Owner/Admin    | Create venue                     |
| PUT    | /venues/:id                   | Owner/Admin    | Update venue                     |
| DELETE | /venues/:id                   | Owner/Admin    | Delete venue                     |

### Bookings
| Method | Endpoint                  | Auth | Description                               |
|--------|---------------------------|------|-------------------------------------------|
| POST   | /bookings                 | Yes  | Create booking (auto-waitlist on conflict)|
| GET    | /bookings/my              | Yes  | Get my bookings                           |
| GET    | /bookings/:id             | Yes  | Get single booking                        |
| PUT    | /bookings/:id/cancel      | Yes  | Cancel booking (promotes waitlist)        |
| GET    | /bookings/venue/:venueId  | Owner| Get all bookings for a venue              |

### Recommendations
| Method | Endpoint                    | Auth | Description                         |
|--------|-----------------------------|------|-------------------------------------|
| GET    | /recommendations            | Yes  | Get ML-scored venue recommendations |
| GET    | /recommendations/similar/:id| No   | Get similar venues                  |

### Analytics
| Method | Endpoint             | Auth | Description                    |
|--------|----------------------|------|--------------------------------|
| GET    | /analytics/stats     | Yes  | Dashboard stats (role-aware)   |
| GET    | /analytics/trends    | Yes  | 30-day booking trend data      |
| GET    | /analytics/categories| No   | Venues per category            |

---

## ML Recommendation System

The recommendation engine in `recommendationController.js` implements a weighted multi-factor scoring model:

```
Score = (rating × 0.25) + (capacity_match × 0.20) + (price_match × 0.20)
      + (category_match × 0.20) + (history_score × 0.15)
```

**Features used:**
- **Rating score** — normalised 0–5 rating
- **Capacity match** — how well venue capacity fits guest count
- **Price match** — budget compliance ratio
- **Category preference** — exact match with requested event type
- **Collaborative filtering** — based on user's past booking categories
- **Seasonal adjustment** — boosts popular venues in peak periods

**Demand forecasting** uses heuristic rules:
- High season months (June, July, August, December)
- Weekend vs weekday classification
- Recent booking volume in last 7 days

To upgrade to a true ML model, replace the scoring function with a trained scikit-learn or TensorFlow.js model.

---

## Role Permissions

| Feature                    | User | Venue Owner | Admin |
|---------------------------|------|-------------|-------|
| Browse & search venues     | ✅   | ✅          | ✅    |
| Book a venue               | ✅   | ✅          | ✅    |
| View own bookings          | ✅   | ✅          | ✅    |
| Cancel own booking         | ✅   | ✅          | ✅    |
| Create/edit/delete venue   | ❌   | ✅ (own)    | ✅    |
| View venue bookings        | ❌   | ✅ (own)    | ✅    |
| View all users             | ❌   | ❌          | ✅    |
| Full analytics             | ❌   | ❌          | ✅    |

---

## Production Deployment

### Backend (e.g. Railway, Render, Heroku)

1. Set environment variables in the platform dashboard
2. Set `NODE_ENV=production`
3. Set `MONGODB_URI` to your Atlas URI
4. Set `FRONTEND_URL` to your deployed frontend URL
5. Deploy the `backend/` folder

### Frontend (e.g. Vercel, Netlify)

1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build command: `npm run build`
3. Publish directory: `frontend/build`
4. Deploy the `frontend/` folder

---

## Common Issues

**MongoDB connection refused**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ MongoDB is not running. Start it with `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux).

**Port already in use**
```
Error: listen EADDRINUSE :::5000
```
→ Change `PORT` in `backend/.env` to another value (e.g. `5001`).

**CORS error in browser**
→ Make sure `FRONTEND_URL` in `backend/.env` matches exactly where your frontend is running (e.g. `http://localhost:3000`).

**JWT_SECRET missing**
→ Make sure you copied `.env.example` to `.env` and filled in the value.

---


*University of the West of Scotland — MSc IT with Project Management — 2025/26*
