# Support Ticket System - Frontend

A modern, real-time support ticket management system built with React 18, Vite, and Tailwind CSS.

## Project Description

This frontend provides an intuitive interface for managing support tickets with real-time updates via WebSocket. It features a responsive dashboard, ticket management workflows, SLA tracking, and comprehensive reporting.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI Framework |
| Vite | 5.0+ | Build Tool & Dev Server |
| Tailwind CSS | 3.3+ | Styling |
| React Router | 6.20+ | Client-side Routing |
| Axios | 1.6+ | HTTP Client |
| Recharts | 2.10+ | Charts & Visualizations |
| React Hot Toast | 2.4+ | Notifications |
| Lucide React | 0.294+ | Icons |
| date-fns | 2.30+ | Date Utilities |

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js          # Axios instance with JWT interceptor
│   ├── components/
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── TopBar.jsx        # Header with search/notifications
│   │   ├── ProtectedRoute.jsx # Auth route guard
│   │   ├── StatCard.jsx      # Dashboard stat cards
│   │   ├── StatusBadge.jsx   # Ticket status badges
│   │   ├── PriorityBadge.jsx # Priority badges
│   │   ├── SLAIndicator.jsx  # SLA countdown/timer
│   │   ├── TicketConversation.jsx # Comment thread
│   │   ├── ActivityTimeline.jsx   # Activity feed
│   │   └── Skeleton.jsx      # Loading skeletons
│   ├── contexts/
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── WebSocketContext.jsx   # WebSocket connection
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── TicketList.jsx    # Ticket listing
│   │   ├── TicketDetail.jsx  # Single ticket view
│   │   ├── CreateTicket.jsx  # New ticket form
│   │   ├── AgentView.jsx     # Agent's ticket view
│   │   ├── CannedResponses.jsx # Canned responses
│   │   └── Reports.jsx       # Analytics reports
│   ├── utils/
│   │   └── format.js         # Date/format utilities
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd project4-support-tickets/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8000/ws` |

### Example .env file

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### Production .env.production

```env
VITE_API_URL=https://your-render-url.onrender.com/api
VITE_WS_URL=wss://your-render-url.onrender.com/ws
```

## Routes & Pages

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/login` | Login | Email/password authentication | No |
| `/dashboard` | Dashboard | Stats, charts, attention tickets | Yes |
| `/tickets` | TicketList | All tickets with filters | Yes |
| `/tickets/new` | CreateTicket | Create new ticket form | Yes |
| `/tickets/:id` | TicketDetail | Single ticket conversation | Yes |
| `/my-tickets` | AgentView | Agent's assigned tickets | Yes |
| `/canned-responses` | CannedResponses | Quick response templates | Yes |
| `/reports` | Reports | Analytics and metrics | Yes |

## Key Components

### StatCard
Live-updating dashboard cards with pulse animation on value changes.

**Props:**
- `title` - Card title
- `value` - Display value
- `icon` - Lucide icon component
- `trend` - Optional trend indicator

### StatusBadge
Color-coded badges for ticket status.

| Status | Color |
|--------|-------|
| Open | Blue |
| In Progress | Amber |
| Waiting on Customer | Yellow |
| Resolved | Green |
| Closed | Gray |

### PriorityBadge
Color-coded badges for ticket priority.

| Priority | Color |
|----------|-------|
| Critical | Red |
| High | Orange |
| Medium | Blue |
| Low | Gray |

### SLAIndicator
Visual indicator showing SLA status.

| State | Color | Description |
|-------|-------|-------------|
| Green | On track | > 25% time remaining |
| Amber | Warning | < 25% time remaining |
| Red | Breached | SLA deadline passed |

### TicketConversation
Differentiates between:
- Customer comments (left/white)
- Agent replies (right/blue)
- Internal notes (yellow)

## WebSocket Integration

The frontend uses WebSocket for real-time updates:

| Event | Direction | Description |
|-------|-----------|-------------|
| `stats_update` | Server → Client | Dashboard stats update |
| `ticket_update` | Server → Client | Ticket data changed |
| `new_comment` | Server → Client | New comment added |
| `typing` | Bidirectional | User is typing |
| `stop_typing` | Bidirectional | User stopped typing |

WebSocket connection is managed via the `WebSocketContext`.

## Design System

### Colors

| Name | Value | Usage |
|------|-------|-------|
| Primary | `#2563eb` | Buttons, links, highlights |
| Success | `#22c55e` | Success states, resolved |
| Warning | `#f59e0b` | Warnings, in progress |
| Danger | `#ef4444` | Errors, critical priority |
| Background | `#f8fafc` | Page background |

### Typography

- **Font Family:** System UI, sans-serif
- **Headings:** font-semibold, tracking-tight
- **Body:** text-sm to text-base

### Spacing

- Standard padding: `p-4` (16px)
- Card padding: `p-6` (24px)
- Section gap: `gap-6` (24px)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Deployment

See the [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions on Vercel.

## License

MIT License
