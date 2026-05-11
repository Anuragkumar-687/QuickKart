<div align="center">
  <h1>🛒 QuickKart</h1>
  <p>A modern, full-stack e-commerce platform built with Next.js, Express, and MongoDB.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<br />

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)

## 🚀 Project Overview

QuickKart is a fully featured, scalable e-commerce platform developed with a modern tech stack. It features an intuitive UI with smooth product browsing, advanced filtering, a dynamic cart system, and a seamless checkout flow. The frontend is built with **Next.js**, styled with **Tailwind CSS**, and enhanced with **GSAP** animations for a premium user experience. The backend relies on an **Express** API Server interacting with **MongoDB** via **Prisma ORM**.

## ✨ Key Features

- **Modern & Responsive UI**: Built with Next.js, React 19, and Tailwind CSS v4, featuring glassmorphism effects and GSAP animations.
- **Robust Authentication**: Secure login and registration using NextAuth.js and JWT, with role-based access control (Admin/Customer).
- **Advanced Product Browsing**: Smooth filtering, sorting, and seamless navigation.
- **Dynamic Cart & Checkout**: Real-time cart updates and a frictionless checkout flow.
- **RESTful API Architecture**: Independent backend service powering product management, cart operations, and order processing.
- **Scalable Deployment**: Ready for deployment on platforms like Vercel (Frontend) and Render (Backend).

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js (v16)](https://nextjs.org/)
- **Library**: [React (v19)](https://react.dev/)
- **Styling**: [Tailwind CSS (v4)](https://tailwindcss.com/)
- **Animations**: [GSAP](https://gsap.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [Express.js (v5)](https://expressjs.com/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ORM**: [Prisma (v5)](https://www.prisma.io/)
- **Security**: JWT & bcryptjs

## 📁 Project Structure

```text
QuickKart/
├── frontend/          # Next.js Application
│   ├── src/           # React Components & Pages
│   ├── public/        # Static Assets
│   └── package.json
└── backend/           # Express API Server
    ├── src/           # Controllers, Routes, Services
    ├── prisma/        # Prisma Schema
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [MongoDB](https://www.mongodb.com/) database cluster

### Environment Variables

You will need to create environment variable files in both the `frontend` and `backend` directories.

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with the following variables:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/quickkart?appName=Cluster0"
JWT_SECRET="your_jwt_secret_key_here"
PORT=5000
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` directory with the following variables:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000" # or your deployed backend URL
NEXTAUTH_SECRET="some-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/QuickKart.git
cd QuickKart/quickkart
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
npm run prisma:generate # Generate Prisma Client
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

## 💻 Running Locally

You need to start both the backend and frontend servers to run the application locally.

**1. Start the Backend Server**
```bash
cd backend
npm run dev
```
The API server will run on `http://localhost:5000`.

**2. Start the Frontend Application**
Open a new terminal window:
```bash
cd frontend
npm run dev
```
The Next.js application will run on `http://localhost:3000`.

## 🌍 Deployment

For detailed deployment instructions for both Vercel (Frontend) and Render/Heroku (Backend), please refer to our [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

---

<div align="center">
  <p>Built by Anurag</p>
</div>
