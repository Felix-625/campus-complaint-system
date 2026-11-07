# Campus Complaint System (MERN Stack)

A full-stack web application designed for university campuses to collect, track, upvote, and resolve campus-wide complaints. The platform enables students to submit complaints either with their student identity or completely anonymously using a cryptographic tracking code, view real-time timeline updates from administration, and highlights overdue issues (> 3 days without progress) to maintain administrative accountability.

---

## 🌟 Key Features

1. **Anonymous Reporting with Tracking Code**:
   - Students can file complaints anonymously without logging in or without linking their student identity.
   - Generates unambiguous tracking codes in the format `CMP-XXXXX` (e.g., `CMP-7K9XM`, excluding visually ambiguous characters like `0/O` and `1/I`).
   - Strict privacy enforcement: Anonymous complaints never store user IDs, IP addresses, or identifying metadata. Public tracking endpoints never leak submitter details.
2. **Public Status Timeline (Vertical Stepper)**:
   - Every complaint has a chronological timeline documenting each stage (`Submitted` → `Under Review` → `In Progress` → `Resolved` / `Rejected`).
   - Timeline entries display timestamps, administrative notes, and the officer who updated the status.
   - Stepper highlights current stage with the accent token and completed stages with primary checkmarks.
3. **Community Upvoting & Image Gallery**:
   - Registered students can upvote active complaints on the Public Board.
   - Public Board displays attached complaint photos with fixed 16:9 thumbnails and an accessible lightbox modal.
   - Graceful neutral fallback placeholders for complaints without photos or on image loading errors.
4. **Overdue Issue Tracking**:
   - Automated detection: Any active issue that has not received a status update in more than **3 days** is flagged as **OVERDUE**.
   - Admin dashboard highlights overdue complaints with danger alert badges and dedicated filter shortcuts.
5. **Admin Management & Analytics Dashboard**:
   - Interactive metric cards for total, active, resolved, and overdue complaints.
   - Interactive charts (using **Recharts**) consuming `--chart-*` tokens showing campus department breakdown and daily volume.
   - Searchable, filterable table with pagination, category/status filters, and an in-place Status Update Modal with attached photo preview.
6. **Accessible Design Tokens & Sidebar Navigation**:
   - Strict CSS-variable design tokens (WCAG 2.2 Education Palette).
   - Responsive sidebar with role-based grouped navigation, user profile snippet, and mobile off-canvas drawer.

---

## 🎨 Design Tokens & Theming Guide

The application uses an accessible token-driven styling system. The single source of truth for all color palettes, typography, spacing, and semantic design tokens is located in:

```text
client/src/styles/tokens.css
```

### 1. Token Purity Rule
`client/src/styles/tokens.css` is the **only** file in the entire project permitted to contain raw hex codes. All React components and Tailwind utilities consume semantic CSS variables (`var(--color-...)`, `var(--status-...)`, `var(--chart-...)`), guaranteeing complete style consistency.

### 2. Base Palette (WCAG 2.2 Checked)
```css
--palette-graphite: #1C1F3A;     /* Primary text, dark backgrounds */
--palette-notebook: #FAF7F0;     /* Warm paper background & light text */
--palette-chalk-green: #1B5845;  /* Primary actions, resolved states */
--palette-highlighter: #FFE45C;  /* Accent highlights, active nav item */
--palette-ruby: #B1223F;         /* Danger, rejected & overdue alerts */
--palette-periwinkle: #C9CCFF;   /* Info, in-progress states */
```

### 3. How to Change the Theme (Editing `tokens.css` Only)
To re-theme the entire application (e.g., brand recoloring, dark mode, high contrast), modify the hex definitions on `:root` inside `tokens.css`:

```css
:root {
  /* Replace base hex values with your institution's brand palette: */
  --palette-graphite: #1E293B;
  --palette-notebook: #F8FAFC;
  --palette-chalk-green: #0D9488;
  --palette-highlighter: #FDE047;
  --palette-ruby: #E11D48;
  --palette-periwinkle: #A5B4FC;
}
```

The entire UI—including surfaces, text, buttons, borders, focus rings, status badges, and Recharts analytics—will automatically adapt immediately without requiring any edits to JavaScript or JSX files.

### 4. Contrast & Accessibility Guarantees
- **Highlighter & Periwinkle**: Always paired with `--palette-graphite` text (`text-on-accent`), exceeding WCAG AAA contrast ratio (> 10:1).
- **Notebook Surface**: Text on notebook always uses `--palette-graphite` (`--color-text`) or mixed graphite (`--color-text-muted`, >= 4.5:1 contrast). Accent (highlighter) is never used as text color directly on the notebook background.
- **Focus Rings**: Two-tier focus ring using highlighter with graphite outline offset (`:focus-visible`), visible on both dark and light surfaces.
- **Form Accessibility**: All forms feature visible labels, `role="alert"` error containers with danger icons, `aria-invalid`, and `aria-describedby` associations.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite) in plain JavaScript, React Router, Axios, Tailwind CSS v3, Lucide React icons, Recharts
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB (supports local MongoDB or MongoDB Atlas via `MONGODB_URI`)
- **Authentication**: JWT (JSON Web Tokens) Bearer token authentication with bcrypt password hashing
- **Security & Validation**: Helmet (with CORP on `/uploads`), CORS (configured for `CLIENT_URL`), express-rate-limit, centralized JSON error handling

---

## 📂 Project Structure

```text
campus-complaint-system/
├── server/
│   ├── config/
│   │   └── db.js                 # Mongoose connection handler
│   ├── controllers/
│   │   ├── adminController.js    # Admin complaints, status updates & stats
│   │   ├── authController.js     # Register, login, get current profile
│   │   └── complaintController.js# Submit, track, public board & upvoting
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & admin role check
│   │   ├── errorHandler.js       # Centralized JSON error handling
│   │   ├── rateLimiter.js        # Login & submission rate limits
│   │   └── upload.js             # Multer image attachment handler
│   ├── models/
│   │   ├── Complaint.js          # Complaint schema with timeline & privacy rules
│   │   └── User.js               # User schema with bcrypt comparison
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin/* endpoints
│   │   ├── authRoutes.js         # /api/auth/* endpoints
│   │   └── complaintRoutes.js    # /api/complaints/* endpoints
│   ├── utils/
│   │   ├── officeMapping.js      # Category to campus department mapping
│   │   ├── seed.js               # Database seed script for admin & samples
│   │   └── trackingCode.js       # Unambiguous code generator (CMP-XXXXX)
│   ├── uploads/                  # Uploaded complaint photos (static with CORP)
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express server entry point
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with getImageUrl helper
│   │   ├── components/
│   │   │   ├── AppLayout.jsx     # Responsive sidebar layout & mobile drawer
│   │   │   ├── Badges.jsx        # Accessible StatusBadge & CategoryBadge
│   │   │   ├── Footer.jsx        # Footer component
│   │   │   ├── ImageLightbox.jsx # Accessible image lightbox modal
│   │   │   └── ProtectedRoute.jsx# Auth & Admin route guards
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & state
│   │   ├── pages/
│   │   │   ├── AdminComplaints.jsx# Filterable table & modal with photo preview
│   │   │   ├── AdminDashboard.jsx # Analytics metrics, charts & overdue alerts
│   │   │   ├── Home.jsx           # Landing page with hero & quick tracker
│   │   │   ├── Login.jsx          # Login page with demo autofill buttons
│   │   │   ├── MyComplaints.jsx   # Student's submitted complaints
│   │   │   ├── PublicBoard.jsx    # Public complaints grid with 16:9 images
│   │   │   ├── Register.jsx       # Student registration form
│   │   │   ├── SubmitComplaint.jsx# Form with tracking code modal & photo upload
│   │   │   └── TrackComplaint.jsx # Lookup with vertical status stepper
│   │   ├── styles/
│   │   │   └── tokens.css        # Single source of truth for design tokens
│   │   ├── App.jsx               # Routes configuration with AppLayout
│   │   ├── index.css             # Tailwind CSS & global focus/motion rules
│   │   └── main.jsx              # Vite entry point (imports tokens.css first)
│   ├── .env                      # Client API URL configuration
│   ├── .env.example              # Client template
│   ├── package.json              # Frontend dependencies and scripts
│   ├── tailwind.config.js        # Tailwind CSS mapped to CSS variable tokens
│   └── vite.config.js            # Vite configuration
│
├── .gitignore                    # Root gitignore (excludes node_modules, .env, uploads)
└── README.md                     # Setup instructions & documentation
```

---

## 🚀 Setup & Installation (Windows PowerShell)

### 1. Prerequisites
- **Node.js** (v18+ or v20+) installed on Windows.
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection string.

---

### 2. Backend Setup (`server/`)

Open a PowerShell terminal:

```powershell
# Navigate to the server folder
cd "c:\Users\FELIX\Campus Complaint System\server"

# Install backend dependencies
npm install

# Run database seed script to populate default admin, student, and sample complaints
npm run seed

# Start backend server in development mode
npm run dev
```

The server will start on `http://localhost:5000`. You can test the health endpoint anytime:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

---

### 3. Frontend Setup (`client/`)

Open a **second** PowerShell terminal:

```powershell
# Navigate to the client folder
cd "c:\Users\FELIX\Campus Complaint System\client"

# Install client dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 📋 Sample Tracking Codes to Test

| Tracking Code | Category | Status | Notes |
| :--- | :--- | :--- | :--- |
| `CMP-8E5VA` | Facilities | In Progress | **OVERDUE** (Inactive for > 3 days; highlighted in red) |
| `CMP-7K9XM` | Facilities | Submitted | Broken AC in Room 302 (Includes attached photo) |
| `CMP-3P8RT` | Academic | Under Review | Anonymous complaint on textbook shortage |
| `CMP-9Y4W2` | Security | In Progress | Streetlight flickering near East Parking |
| `CMP-5N2HQ` | Canteen | Resolved | Fully resolved with multi-step timeline |

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` - Register student account (name, email, password, department)
- `POST /api/auth/login` - Authenticate user, rate limited (returns JWT token and profile)
- `GET /api/auth/me` - Get current authenticated user profile (`Authorization: Bearer <token>`)

### Complaints
- `POST /api/complaints` - File complaint (public/student, rate-limited, optional multer image, supports `isAnonymous`)
- `GET /api/complaints/track/:code` - Track complaint status & timeline (public, privacy-safe projection)
- `GET /api/complaints/public` - Public board listing non-rejected complaints (supports `?category=` and `?status=`, returns `imageUrl`)
- `GET /api/complaints/mine` - Student's personal complaints (`Authorization: Bearer <token>`)
- `POST /api/complaints/:id/upvote` - Toggle student upvote on a complaint

### Administration (Admin Only)
- `GET /api/admin/complaints` - Paginated complaint list with search, category, status, and overdue filters
- `PATCH /api/admin/complaints/:id/status` - Update status and append new entry to timeline
- `GET /api/admin/stats` - Total counts by status and category, overdue count, and 14-day daily complaint counts

---

## 🔒 Privacy & Overdue Specifications

- **Privacy**: When a user selects "Submit Anonymously", `submittedBy` is explicitly set to `null` before saving. Request bodies for anonymous routes are not logged. The public tracking endpoint (`GET /api/complaints/track/:code`) never returns user identifiers.
- **Overdue Definition**: A complaint is marked **OVERDUE** if:
  1. Its status is neither `Resolved` nor `Rejected`.
  2. The timestamp of the last timeline entry is greater than **3 days** (72 hours) old.
