# Expense Tracker - MERN Stack

A full-stack **Expense Tracker** application built with the MERN stack (**MongoDB, Express.js, React, Node.js**). This app helps users track income and expenses, set monthly budgets, visualize spending with charts, and manage personal finances effectively.  

**Live Demo:** [Add your deployed link here]  

---

## Features

- User authentication (Register/Login with JWT)  
- Add, edit, delete transactions (income/expense)  
- Categorize expenses (Food, Transport, Shopping, etc.)  
- Set monthly budgets per category with progress tracking  
- Interactive dashboard with stats (total income, expenses, balance)  
- Data visualization using **Recharts** (line, bar, pie charts)  
- Export transactions to CSV  
- Responsive design with **Tailwind CSS** and **Lucide icons**

---

## Tech Stack

### Frontend
- **React.js** (Vite)  
- **Tailwind CSS**  
- **Lucide React** (icons)  
- **Recharts** (charts)  
- **Axios** (API calls)  

### Backend
- **Node.js**  
- **Express.js**  
- **MongoDB** (with Mongoose)  
- **JWT** (authentication)  
- **Bcrypt** (password hashing)  

---

## Architecture Overview

This project follows the **MERN stack architecture**:

1. **Frontend** (React + Tailwind CSS) handles the UI and user interactions.  
2. **Backend** (Node.js + Express.js) manages APIs, authentication, and business logic.  
3. **MongoDB** stores users, transactions, and budget data.  
4. **JWT** secures authentication.  
5. **Recharts** is used for interactive data visualizations.  

---

## Project Structure

```

expense-tracker-mern/
├── backend/
│   ├── config/          # DB connection
│   ├── middleware/      # Auth middleware
│   ├── models/          # User, Expense, Budget schemas
│   ├── routes/          # Auth, expenses, budgets
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── App.jsx      # Main app logic
│   │   └── api/         # Axios instance
│   ├── public/
│   └── vite.config.js
└── README.md

````

---

## Setup & Installation

### Prerequisites
- **Node.js** (v18+)  
- **MongoDB** (local or MongoDB Atlas)  

### 1. Clone the repository
```bash
git clone https://github.com/svithjeshayan/expense-tracker-mern.git
cd expense-tracker-mern
````

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Edit .env with your MongoDB URI and JWT secret
npm run dev            # Starts server on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

### Environment Variables (`.env` in backend)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
NODE_ENV=development
```

---

## Deployment

* **Frontend:** Deploy on Vercel or Netlify
* **Backend:** Deploy on Render, Heroku, or Cyclic
* **Database:** Use MongoDB Atlas for production

---

## Contributing

Feel free to fork, open issues, or submit pull requests!

---

## License

This project is licensed under the **MIT License**.

---

Built with ❤️ by **svithjeshayan**
Star this repo if you found it helpful! ⭐

```
