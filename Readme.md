# 💰 Money Manager - Advanced Expense Tracker (MERN)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/frontend-React_Vite-61DAFB.svg)
![Node](https://img.shields.io/badge/backend-Node_Express-339933.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248.svg)

**Money Manager** is a comprehensive, full-stack personal finance application designed to help users track expenses, manage budgets, and visualize financial trends. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a highly responsive mobile-first design, robust security with 2FA, and real-time analytics.

---

## ✨ Key Features

### 📱 User Experience (10/10)

- **Fluid Reponsive Design**: Optimized for everything from usage on large desktop monitors to compact mobile devices like the **iPhone SE**.
- **Mobile-First Navigation**: Native-app style bottom navigation bar for mobile users.
- **Dark Mode**: Fully supported system-wide dark theme.
- **PWA Support**: Installable as a Progressive Web App (PWA) with offline capabilities.
- **Glassmorphism UI**: Premium visual aesthetics with blur effects and smooth micro-animations.

### 🛡️ Security & Reliability

- **Two-Factor Authentication (2FA)**: Secure login with TOTP (Google Authenticator).
- **Secure Sessions**: HTTP-Only cookies and JWT authentication.
- **Audit Logging**: Comprehensive tracking of all security-critical actions.
- **Rate Limiting & CSP**: Protection against brute-force and XSS attacks.

### 📊 Financial Tools

- **Dashboard**: Real-time overview of custom Equity, Assets, and Liabilities.
- **Expense Tracking**: Detailed categorised logging of income and expenses.
- **Trend Analysis**: Predictive insights and month-over-month comparisons.
- **Budget Management**: Set and track monthly limits per category with visual alerts.
- **Data Export**: Export your financial history to CSV for external analysis.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB Atlas.
- **Testing**: Jest, Supertest, Vitest.

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/money-manager.git
cd money-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (see `.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_strong_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🧪 Running Tests

**Backend Tests:**

```bash
cd backend
npm test
```

**Frontend Tests:**

```bash
cd frontend
npm test
```

---

## 📁 Project Structure

```
MERN/
├── backend/            # Express API
│   ├── config/         # DB & Passport config
│   ├── jobs/           # Cron jobs (Budget Alerts)
│   ├── middleware/     # Auth, Rate Limiting
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Routes
│   └── jobs/           # Scheduled tasks
│
├── frontend/           # React App
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── test/       # Integration Tests
│   │   └── App.jsx     # Main Application Logic
│   └── public/         # Static Assets & PWA Icons
│
└── README.md           # Documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
