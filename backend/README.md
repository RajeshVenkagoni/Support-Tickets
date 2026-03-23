# Support Ticket System - Backend

A real-time support ticket management API built with Django, Django REST Framework, and Django Channels.

## Project Description

This backend powers a comprehensive support ticket system with real-time WebSocket updates, SLA tracking, and role-based access control. It provides RESTful endpoints for ticket management, user authentication, and analytics reporting.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Programming Language |
| Django | 5.0+ | Web Framework |
| Django REST Framework | 3.15+ | REST API |
| Django Channels | 4.0+ | WebSocket Support |
| PostgreSQL | 15+ | Database |
| SimpleJWT | 5.3+ | Authentication |
| WhiteNoise | 6.7+ | Static Files |
| Daphne | 4.0+ | ASGI Server |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Obtain JWT tokens | No |
| POST | `/api/auth/refresh/` | Refresh access token | No |

### Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/tickets/` | List all tickets | Yes |
| POST | `/api/tickets/tickets/` | Create new ticket | Yes |
| GET | `/api/tickets/tickets/{id}/` | Get ticket details | Yes |
| PATCH | `/api/tickets/tickets/{id}/` | Update ticket | Yes |
| DELETE | `/api/tickets/tickets/{id}/` | Delete ticket | Yes |
| POST | `/api/tickets/tickets/{id}/assign/` | Assign ticket to user | Yes |
| POST | `/api/tickets/tickets/{id}/resolve/` | Resolve ticket | Yes |
| POST | `/api/tickets/tickets/{id}/add_comment/` | Add comment | Yes |
| GET | `/api/tickets/tickets/{id}/comments/` | Get comments | Yes |
| GET | `/api/tickets/tickets/{id}/activity/` | Get activity log | Yes |
| POST | `/api/tickets/tickets/{id}/add_rating/` | Add satisfaction rating | Yes |
| GET | `/api/tickets/tickets/stats/` | Get user stats | Yes |

### Dashboard & Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/dashboard/` | Dashboard statistics | Yes |

### Canned Responses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/canned-responses/` | List canned responses | Yes |
| GET | `/api/tickets/canned-responses/{id}/` | Get canned response | Yes |

### SLA Policies

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/sla-policies/` | List SLA policies | Yes |
| POST | `/api/tickets/sla-policies/` | Create SLA policy (Admin) | Yes |
| PATCH | `/api/tickets/sla-policies/{id}/` | Update SLA policy (Admin) | Yes |
| DELETE | `/api/tickets/sla-policies/{id}/` | Delete SLA policy (Admin) | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/users/` | List users | Yes |

## WebSocket Documentation

### Connection URLs

| Endpoint | Description |
|----------|-------------|
| `ws://host/ws/dashboard/` | Dashboard real-time updates |
| `ws://host/ws/tickets/{ticket_id}/` | Individual ticket updates |

### WebSocket Events

#### Dashboard Channel

**Received Events:**

| Event Type | Payload | Description |
|------------|---------|-------------|
| `ticket_created` | `{ type, ticket_id, ticket_number }` | New ticket created |
| `ticket_updated` | `{ type, ticket_id }` | Ticket modified |
| `ticket_assigned` | `{ type, ticket_id }` | Ticket assigned |
| `ticket_resolved` | `{ type, ticket_id }` | Ticket resolved |

#### Ticket Channel

**Received Events:**

| Event Type | Payload | Description |
|------------|---------|-------------|
| `updated` | `{ type, ticket_number }` | Ticket data changed |
| `assigned` | `{ type, ticket_number, assigned_to }` | Agent assigned |
| `resolved` | `{ type, ticket_number }` | Ticket resolved |
| `new_comment` | `{ type, comment }` | New comment added |

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 15 or higher (or use SQLite for development)
- Redis (optional, for production WebSocket scaling)

### Local Development

1. **Clone and navigate to the project:**
   ```bash
   cd project4-support-tickets/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create default SLA policies:**
   ```bash
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
   EOF
   ```

7. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

   For WebSocket support, use Daphne:
   ```bash
   daphne -b 0.0.0.0 -p 8000 config.asgi:application
   ```

### Using Docker (Optional)

```bash
# Build and run with docker-compose
docker-compose up --build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | - | Django secret key |
| `DEBUG` | No | True | Debug mode (False in production) |
| `DATABASE_URL` | No | SQLite | PostgreSQL connection string |
| `ALLOWED_HOSTS` | No | localhost | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | No | - | Comma-separated CORS origins |

### Example .env file

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/support_tickets
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Data Models

### Ticket
- `ticket_number` - Unique identifier (auto-generated)
- `subject` - Ticket title
- `description` - Detailed description
- `requester_name` - Customer name
- `requester_email` - Customer email
- `category` - Technical, Billing, General, Feature Request, Bug
- `priority` - Critical, High, Medium, Low
- `status` - Open, In Progress, Waiting on Customer, Resolved, Closed
- `assigned_to` - Foreign key to User
- `sla_deadline` - SLA resolution deadline
- `sla_breached` - Whether SLA was breached

### TicketComment
- `ticket` - Foreign key to Ticket
- `author` - Foreign key to User
- `content` - Comment text
- `is_internal` - Internal note flag

### TicketActivity
- `ticket` - Foreign key to Ticket
- `action` - Created, Assigned, Status Changed, etc.
- `performed_by` - User who performed action
- `old_value` / `new_value` - Change tracking

### SLAPolicy
- `priority` - Ticket priority level
- `response_time_hours` - Target response time
- `resolution_time_hours` - Target resolution time

### CannedResponse
- `title` - Response title
- `content` - Response template
- `category` - Response category

### SatisfactionRating
- `ticket` - One-to-one with Ticket
- `rating` - 1-5 star rating
- `comment` - Optional feedback

## Testing

```bash
# Run tests
python manage.py test

# Run with coverage
pytest --cov=tickets
```

## Deployment

See the [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions on Render.

## License

MIT License
