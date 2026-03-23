# 🚀 Deployment Guide

Complete step-by-step guide for deploying the Real-Time Support Ticket System to production.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Supabase Database Setup](#supabase-database-setup)
3. [Render Backend Deployment](#render-backend-deployment)
4. [Vercel Frontend Deployment](#vercel-frontend-deployment)
5. [Environment Variable Configuration](#environment-variable-configuration)
6. [WebSocket Configuration Notes](#websocket-configuration-notes)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

## Overview

This application is deployed using a 3-tier architecture:

| Component | Service | Purpose |
|-----------|---------|---------|
| Database | Supabase / Render PostgreSQL | Data persistence |
| Backend | Render | Django REST API + WebSocket |
| Frontend | Vercel | React SPA |

### Deployment Flow

```
1. Set up PostgreSQL database (Supabase)
         ↓
2. Deploy Django backend (Render)
         ↓
3. Get backend URL from Render
         ↓
4. Configure frontend environment variables
         ↓
5. Deploy React frontend (Vercel)
         ↓
6. Test WebSocket connections
```

---

## Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name:** `support-tickets-db`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
5. Click **"Create new project"**

### Step 2: Get Connection String

1. Wait for the project to initialize (~2 minutes)
2. Go to **Project Settings** (gear icon) → **Database**
3. Under **Connection string**, select **URI** format
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password

Example:
```
postgresql://postgres:password@db.xxxxxxxxxx.supabase.co:5432/postgres
```

### Step 3: Note the Connection Details

You'll need these for Render:
- Full connection URI
- Password (the one you created)

**Alternative:** Use Render's PostgreSQL (free tier available)

---

## Render Backend Deployment

### Step 1: Prepare Your Repository

Ensure your repository has these files:
```
backend/
├── render.yaml       # Render configuration
├── build.sh          # Build script (executable)
├── Procfile          # Process definition
├── requirements.txt  # Python dependencies
└── config/
    └── asgi.py       # ASGI application entry
```

Make `build.sh` executable:
```bash
git update-index --chmod=+x backend/build.sh
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Select the repository containing your code

### Step 3: Configure Service

Use these settings:

| Setting | Value |
|---------|-------|
| **Name** | `support-tickets-api` |
| **Environment** | `Python` |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend` |
| **Build Command** | `./build.sh` |
| **Start Command** | `daphne -b 0.0.0.0 -p $PORT config.asgi:application` |
| **Plan** | `Free` |

### Step 4: Add Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.11.0` | Python version |
| `SECRET_KEY` | Generate or paste | Use a strong random string |
| `DATABASE_URL` | Your Supabase URI | From Supabase setup |
| `DEBUG` | `False` | Production mode |
| `ALLOWED_HOSTS` | `.onrender.com,localhost` | Add your domain |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app` | Frontend URL pattern |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start the deployment process
3. Watch the logs for any errors
4. Once complete, note your service URL: `https://support-tickets-api.onrender.com`

### Step 6: Create Superuser (Optional)

To access Django admin:

1. Go to Render dashboard → your service → **Shell**
2. Run:
   ```bash
   python manage.py createsuperuser
   ```
3. Follow prompts to create admin user

---

## Vercel Frontend Deployment

### Step 1: Prepare Frontend

Ensure your frontend has:
```
frontend/
├── vercel.json       # Vercel configuration
├── .env.production   # Production environment template
└── dist/             # Build output (created during build)
```

### Step 2: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Select the repository

### Step 3: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 4: Add Environment Variables

Add these environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://your-render-url.onrender.com/api` |
| `VITE_WS_URL` | `wss://your-render-url.onrender.com/ws` |

Replace `your-render-url` with your actual Render service URL.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Vercel will provide a deployment URL: `https://your-project.vercel.app`

### Step 6: Update CORS (Important!)

After getting your Vercel URL, update Render environment variables:

1. Go to Render dashboard → your service → **Environment**
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-project.vercel.app,https://*.vercel.app
   ```
3. Save changes and redeploy

---

## Environment Variable Configuration

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET_KEY` | ✅ | Django secret key | `django-insecure-xxx...` |
| `DEBUG` | ✅ | Debug mode | `False` |
| `DATABASE_URL` | ✅ | PostgreSQL connection | `postgresql://...` |
| `ALLOWED_HOSTS` | ✅ | Allowed hostnames | `.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | ✅ | CORS origins | `https://*.vercel.app` |
| `PYTHON_VERSION` | ❌ | Python version | `3.11.0` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | API base URL | `https://api.example.com/api` |
| `VITE_WS_URL` | ✅ | WebSocket URL | `wss://api.example.com/ws` |

---

## WebSocket Configuration Notes

### WebSocket vs HTTP

| Protocol | URL Pattern | Usage |
|----------|-------------|-------|
| HTTP REST API | `https://.../api/...` | CRUD operations |
| WebSocket | `wss://.../ws/...` | Real-time updates |

### Important Considerations

1. **SSL Required**: Production WebSockets must use `wss://` (secure)

2. **Path Routing**: Ensure your WebSocket paths are not blocked:
   ```javascript
   // Frontend WebSocket connection
   const wsUrl = 'wss://your-api.onrender.com/ws/dashboard/';
   const socket = new WebSocket(wsUrl);
   ```

3. **Connection Limits**: Free tiers may have connection limits

4. **Heartbeat**: Implement ping/pong to keep connections alive:
   ```javascript
   // In your WebSocket context
   setInterval(() => {
     if (socket.readyState === WebSocket.OPEN) {
       socket.send(JSON.stringify({ type: 'ping' }));
     }
   }, 30000);
   ```

5. **Reconnection**: Implement automatic reconnection:
   ```javascript
   socket.onclose = () => {
     setTimeout(() => connectWebSocket(), 3000);
   };
   ```

---

## Post-Deployment Verification

### 1. Test API Endpoints

```bash
# Test health check
curl https://your-api.onrender.com/api/tickets/dashboard/

# Should return 401 (unauthorized) or dashboard data if authenticated
```

### 2. Test WebSocket Connection

Open browser console on your Vercel app:
```javascript
const socket = new WebSocket('wss://your-api.onrender.com/ws/dashboard/');
socket.onopen = () => console.log('Connected!');
socket.onmessage = (e) => console.log('Message:', e.data);
socket.onerror = (e) => console.error('Error:', e);
```

### 3. Test Full Flow

1. Open frontend in browser
2. Register a new user
3. Create a ticket
4. Verify real-time updates appear
5. Add a comment
6. Verify comment appears without refresh

### 4. Check Logs

**Render Logs:**
- Dashboard → your service → **Logs**

**Vercel Logs:**
- Dashboard → your project → **Deployments** → Click deployment → **Functions**

---

## Troubleshooting

### Backend Issues

#### Database Connection Failed
```
Error: could not translate host name
```
**Solution:** Check DATABASE_URL format and ensure Supabase is active

#### Static Files 404
```
404 Not Found for /static/...
```
**Solution:** Ensure `build.sh` runs `collectstatic` and WhiteNoise is configured

#### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution:** Update `CORS_ALLOWED_ORIGINS` with exact frontend URL

#### WebSocket Connection Failed
```
WebSocket connection failed
```
**Solution:** 
1. Use `wss://` not `ws://`
2. Check ASGI configuration
3. Verify Daphne is running: `daphne -b 0.0.0.0 -p $PORT config.asgi:application`

### Frontend Issues

#### Build Failed
```
Module not found
```
**Solution:** Run `npm install` locally and fix any missing dependencies

#### API 404 Errors
```
404 Not Found for /api/...
```
**Solution:** Check `VITE_API_BASE_URL` ends with `/api` (not `/api/`)

#### Blank Page After Deploy
```
Routing not working
```
**Solution:** Ensure `vercel.json` has rewrite rules for SPA routing

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Django Channels](https://channels.readthedocs.io/)

---

## 🎉 Success!

Your Real-Time Support Ticket System should now be fully deployed and operational!

**URLs to Bookmark:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-api.onrender.com/api/`
- Django Admin: `https://your-api.onrender.com/api/admin/`

For support or issues, refer to the troubleshooting section or check the application logs.
