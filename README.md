# ShowTime - Movie Ticket Booking Web Application (BookMyShow Clone)

A full-stack, feature-rich movie ticket booking platform built with **React.js**, **Django REST Framework (DRF)**, and **PostgreSQL**. Featuring dynamic seat maps, simulated real-time seat locks, automated invoice PDF rendering, QR code scannables, and a dashboard for metrics analytics.

---

## Tech Stack

*   **Frontend**: React (Vite-based), HTML5, CSS3, Axios, Lucide React (Icons), React Router.
*   **Backend**: Python, Django, Django REST Framework, Simple JWT, ReportLab (PDF), python-qrcode (QR).
*   **Database**: SQLite (default fallback for local dev) & PostgreSQL (production & Docker environment).
*   **Containerization**: Docker, Docker Compose.

---

## Features

1.  **JWT Authentication**: Registration, token-refresh logic, role permissions (`customer` vs `admin`).
2.  **Home Landing**: Featured slideshows, search inputs, categories tabs, trending/upcoming segments.
3.  **Show Selector**: Date slider slots, location filtering, grouping shows under theaters.
4.  **Seating Layout Grid**: Interactive 10x10 seat selector, VIP/Premium pricing ranges, transient holdings.
5.  **Atomic Seat Locking**: 5-minute seat locks to prevent double-booking collisions.
6.  **Billing & Checkout**: Billing calculations, mock card portals, automatic invoice compilation.
7.  **Success Invoices**: Confirmed receipts, scannable QR codes, and native PDF ticket downloads.
8.  **Admin Portal**: Database models management tables, and dynamic SVG line/bar metrics charts.

---

## Setup & Running Locally

### Option A: Standard Local Setup (Easy)

#### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)

#### 1. Backend Service
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # Windows activation
    .\venv\Scripts\activate
    # macOS/Linux activation
    source venv/bin/activate
    ```
3.  Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations and seed the database with mock historical analytics data:
    ```bash
    python manage.py makemigrations users movies bookings payments
    python manage.py migrate
    python manage.py seed_data
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```
    The server will start at `http://127.0.0.1:8000/`.

#### 2. Frontend Client
1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173/`.

---

### Option B: Docker Compose Setup (PostgreSQL)

Launch the entire stack (Database, Django, React) with a single command:
```bash
docker-compose up --build
```
*   **Frontend**: `http://localhost:5173/`
*   **Backend API**: `http://localhost:8000/api/`
*   **PostgreSQL**: Exposes `5432` internally.

---

## API Documentation

### Auth APIs
*   `POST /api/users/register/` - Create a new user account.
*   `POST /api/users/login/` - Login and receive JWT access/refresh tokens.
*   `POST /api/users/token/refresh/` - Renew expired access tokens.
*   `GET/PUT /api/users/profile/` - Fetch/update logged-in user profile.

### Movies & Shows APIs
*   `GET /api/movies/list/` - List movies (Filters: `?search=`, `?category=`, `?language=`, `?is_trending=`, `?is_upcoming=`).
*   `POST /api/movies/list/` - Add a new movie (Admin Only).
*   `GET /api/movies/theaters/` - List theaters.
*   `GET /api/movies/shows/` - List showtimes (Filters: `?movie=`, `?date=YYYY-MM-DD`, `?theater=`).

### Bookings & Payments APIs
*   `GET /api/bookings/shows/<show_id>/seats/` - Retrieve 10x10 seat layout with real-time status.
*   `POST /api/bookings/lock/` - Reservce selected seats for 5 mins. Payload: `{"show_id": int, "seat_ids": [...]}`. Returns pending `booking_id`.
*   `POST /api/payments/process/` - Confirm checkout transaction and compile ticket. Payload: `{"booking_id": "string", "payment_method": "Card"}`. Returns scannable ticket PDF & QR.
*   `GET /api/bookings/my-bookings/` - Retrieve booking log history.
*   `GET /api/users/admin/analytics/` - Compile business metrics reports (Admin Only).

---

## Deployment Steps

### Frontend Deployment (Vercel)
1.  Push the code to GitHub.
2.  Connect your repo on Vercel Dashboard.
3.  Set the **Root Directory** as `client`.
4.  Configure the build commands:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Set environment variables:
    *   `VITE_API_URL` = `<your-render-backend-url>/api/`
    *   `VITE_BACKEND_URL` = `<your-render-backend-url>`
6.  Click **Deploy**.

### Backend Deployment (Render)
1.  Connect your repo on Render Dashboard and create a new **Web Service**.
2.  Set the **Root Directory** as `server`.
3.  Set settings:
    *   **Runtime**: `Python`
    *   **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
    *   **Start Command**: `gunicorn settings.wsgi:application --bind 0.0.0.0:$PORT`
4.  Provision a **PostgreSQL Database** on Render and copy the database URI.
5.  Set Environment Variables on the Web Service:
    *   `SECRET_KEY` = `your-secure-secret-key`
    *   `DEBUG` = `False`
    *   `DB_NAME` = `db_name`
    *   `DB_USER` = `db_user`
    *   `DB_PASSWORD` = `db_password`
    *   `DB_HOST` = `db_host`
    *   `DB_PORT` = `5432`
6.  Click **Deploy**.
