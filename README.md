# FlowDesk 🚀

FlowDesk is a premium SaaS application for team collaboration and task management. It features enterprise-grade **Multi-Tenancy**, **Real-time Activity Logs**, and a high-performance **Kanban Board**—all powered by a modern **PostgreSQL** persistence layer.

## ✨ Features

- **Multi-Tenant Isolation**: Robust data separation at the Organization level.
- **Dynamic Kanban Board**: Seamlessly manage tasks with drag-and-drop status updates.
- **Activity Stream**: Real-time audit trail of all project and task changes.
- **Organization Dashboard**: Instant overview of project progress, open tasks, and recent team activity.
- **Secure Authentication**: JWT-based stateless security with organization-scoped permissions.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Animation:** Framer Motion (for premium micro-interactions)
- **State & Data:** Zustand (UI state) + `@tanstack/react-query` (Server state)
- **Forms:** React Hook Form + Zod validation

### Backend
- **Framework:** Spring Boot 3
- **Database:** PostgreSQL (Standard-compliant relational storage)
- **ORM:** Hibernate / Spring Data JPA
- **Security:** Spring Security + JWT
- **Performance:** Optimized multi-tenant query filtering

---

## 💻 Prerequisites

- **Java JDK 17+**
- **Node.js (v18+)**
- **Maven**
- **PostgreSQL** (Ensure a database named `flowdesk` is created)

---

## 🏃‍♂️ Getting Started

### 1. Database Setup
Create a PostgreSQL database named `flowdesk`. Update `flowdesk-backend/src/main/resources/application.properties` with your credentials if different from the defaults.

### 2. Start the Backend
```bash
cd flowdesk-backend
mvn spring-boot:run
```
The API server will start on `http://localhost:8080`.

### 3. Start the Frontend
```bash
cd flowdesk-frontend
npm install --legacy-peer-deps
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## ✅ Phase 3 Status: Ready for Demonstration
The application has been fully integrated for the final phase. 

- **Live API Integration**: All frontend pages (Projects, Kanban, Activity) are wired to real backend endpoints.
- **Persistence Verified**: Kanban drag-and-drop state is persisted via PostgreSQL.
- **Test Coverage**: Core security (JWT) and service logic (Task management) are covered by unit tests.
- **Build Verified**: Production build is verified and stable on Windows/Linux environments.

---

## 🧪 Verification
To verify the application:
1. Run backend tests: `cd flowdesk-backend && mvn test`
2. Run frontend build: `cd flowdesk-frontend && npm run build`
3. Launch services and perform end-to-end testing from the browser.

---

## 📂 Project Structure

- `/flowdesk-backend`: Spring Boot REST API (Java).
- `/flowdesk-frontend`: React user interface (Vite).
- `/artifacts`: Project management, implementation plans, and architecture walkthroughs.

## 📄 License
This project is part of the FSD Coursework.