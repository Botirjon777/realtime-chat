# Real-Time Chat System (NestJS + Next.js + MSSQL)

A professional real-time chat solution with an operator dashboard, super admin analytics, and MSSQL persistence.

## 🚀 Quick Start

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` (Database & Redis)
4. `npm run start:dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 🏗️ Standalone Redis Setup
This project uses **Redis** for real-time tracking. If you are not using Docker:

### Windows
1. Download **Redis-x64-x.x.x.zip** from [Microsoft Archive](https://github.com/microsoftarchive/redis/releases).
2. Run `redis-server.exe`.
3. Update `.env` to `REDIS_PORT=6379`.

### Ubuntu / Linux
1. `sudo apt update && sudo apt install redis-server`.
2. `sudo systemctl enable redis-server`.
3. `sudo systemctl restart redis-server`.

---

## 🔐 Credentials

### Super Admin
- **Email**: `admin@chat.com`
- **Password**: `admin123`

### Default Operator
- Create via the Admin Dashboard.

---

## 🛠️ Features
- **Real-time Messaging**: Socket.io integration for instant communication.
- **Operator Dashboard**: Tabbed queue management (Active/History), collapsible sidebar, and waiting time tracking.
- **Super Admin**: Analytics dashboard (KPIs), operator management (CRUD).
- **Authentication**: JWT-based auth with Role-Based Access Control (RBAC).
- **Database**: MSSQL integration via TypeORM.
- **State Management**: Zustand for reactive frontend state.
