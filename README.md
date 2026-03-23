# 🎫 Real-Time Support Ticket System

A modern, full-stack support ticket management system with real-time updates, SLA tracking, and comprehensive analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔐 **JWT Authentication** - Secure login with token-based authentication
- ⚡ **Real-Time Updates** - WebSocket-powered live ticket updates and dashboard stats
- 📊 **Analytics Dashboard** - Visual metrics with charts and KPI tracking
- 🎫 **Ticket Management** - Full CRUD operations with filtering, sorting, and pagination
- 🏷️ **SLA Tracking** - Automated SLA deadlines with breach notifications
- 👥 **Agent Assignment** - Smart ticket assignment and workload management
- 💬 **Conversation Thread** - Rich commenting system with internal notes
- 📋 **Canned Responses** - Pre-defined response templates for faster resolution
- ⭐ **Satisfaction Ratings** - Customer feedback collection
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔍 **Advanced Search** - Full-text search across tickets
- 📈 **Reports & Metrics** - Comprehensive reporting capabilities

## 🛠️ Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=flat&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-3.15+-ff1709?style=flat)
![Django Channels](https://img.shields.io/badge/Channels-4.0+-46a9b0?style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.20+-CA4245?style=flat&logo=react-router&logoColor=white)

## 📸 Screenshots

| Dashboard | Ticket List | Ticket Detail |
|-----------|-------------|---------------|
| ![Dashboard](./screenshots/dashboard.png) | ![Ticket List](./screenshots/ticket-list.png) | ![Ticket Detail](./screenshots/ticket-detail.png) |

*Note: Screenshots are placeholders. Add actual screenshots in the `screenshots/` directory.*

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React + Vite                          │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │  Dashboard  │  │  Ticket List │  │ Ticket Detail  │  │    │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │ HTTPS         │ WebSocket      │
              ▼               ▼                │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Render)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Django + Django REST Framework              │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │  REST API   │  │   WebSocket  │  │   JWT Auth     │  │    │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Database (PostgreSQL)                       │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │   Tickets   │  │    Users     │  │  SLA Policies  │  │    │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use SQLite for development)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create default SLA policies
python manage.py shell << EOF
from tickets.models import SLAPolicy
policies = [
    ('Critical', 1, 4),
    ('High', 2, 8),
    ('Medium', 4, 24),
    ('Low', 8, 72),
]
for priority, response, resolution in policies:
    SLAPolicy.objects.get_or_create(
        priority=priority,
        defaults={'response_time_hours': response, 'resolution_time_hours': resolution}
    )
print('SLA policies created')
EOF

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📦 Deployment

### Backend - Render

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy!

### Frontend - Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Configure environment variables
6. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/tickets/` | List all tickets |
| POST | `/api/tickets/tickets/` | Create new ticket |
| GET | `/api/tickets/tickets/{id}/` | Get ticket details |
| PATCH | `/api/tickets/tickets/{id}/` | Update ticket |
| POST | `/api/tickets/tickets/{id}/assign/` | Assign ticket |
| POST | `/api/tickets/tickets/{id}/resolve/` | Resolve ticket |
| POST | `/api/tickets/tickets/{id}/add_comment/` | Add comment |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/dashboard/` | Dashboard statistics |

For complete API documentation, see [backend/README.md](./backend/README.md).

## 🔌 WebSocket Events

### Dashboard Channel (`ws://host/ws/dashboard/`)

| Event Type | Description |
|------------|-------------|
| `ticket_created` | New ticket created |
| `ticket_updated` | Ticket modified |
| `ticket_assigned` | Ticket assigned |
| `ticket_resolved` | Ticket resolved |

### Ticket Channel (`ws://host/ws/tickets/{id}/`)

| Event Type | Description |
|------------|-------------|
| `updated` | Ticket data changed |
| `assigned` | Agent assigned |
| `resolved` | Ticket resolved |
| `new_comment` | New comment added |

## 📁 Project Structure

```
project4-support-tickets/
├── backend/
│   ├── config/                 # Django configuration
│   ├── tickets/                # Main application
│   │   ├── models.py           # Data models
│   │   ├── views.py            # API views
│   │   ├── serializers.py      # DRF serializers
│   │   ├── consumers.py        # WebSocket consumers
│   │   └── urls.py             # URL routing
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment config
│   ├── build.sh                # Build script
│   └── README.md               # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React contexts
│   │   ├── api/                # API integration
│   │   └── utils/              # Utilities
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   └── README.md               # Frontend documentation
├── README.md                   # This file
└── DEPLOYMENT.md               # Deployment guide
```

## 🔒 Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (True/False) |
| `DATABASE_URL` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_WS_URL` | WebSocket server URL |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Channels](https://channels.readthedocs.io/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
