# FlowDesk

FlowDesk is a SaaS application for team collaboration and task management (featuring Kanban boards, Activity Logs, and Multi-Tenancy).

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS, Radix UI Primitives, class-variance-authority, clsx, tailwind-merge
- **Animation:** Framer Motion
- **State Management:** Zustand (Client state), `@tanstack/react-query` (Server state)
- **Routing:** React Router v7
- **Forms & Validation:** react-hook-form, Zod
- **Drag and Drop:** @dnd-kit

### Backend
- **Framework:** Spring Boot
- **Database:** H2 (In-memory for Phase 1), PostgreSQL (Phase 2)
- **ORM:** Hibernate / Spring Data JPA

---

## 💻 Prerequisites
Required versions:
- Node.js (v18+)
- npm or yarn
- Java JDK 17+
- Maven

---

## 🏃‍♂️ Running the Project

The application requires both the backend and frontend to be running simultaneously.

### 1. Start the Backend (Spring Boot)
Open a terminal and navigate to the `flowdesk-backend` directory, then run:

```bash
cd flowdesk-backend
mvn spring-boot:run
```
The Spring Boot server will start on `http://localhost:8080`.

### 2. Start the Frontend (Vite/React)
Open a separate terminal and navigate to the `flowdesk-frontend` directory. Make sure to install dependencies first using `--legacy-peer-deps` due to some peer dependency mismatches with `eslint`:

```bash
cd flowdesk-frontend
npm install --legacy-peer-deps
npm run dev
```
The React frontend will start on `http://localhost:5173`. Open this URL in your browser.

---

## 📂 Project Structure

- `/flowdesk-backend`: Spring Boot REST API application.
- `/flowdesk-frontend`: React user interface application.
- `/db`: Database schemas or mock data.
- `Instruction-member*.md`, `WorkDivision_FlowDesk.docx`, `context.md`, `FlowDesk_synopsis...`: Project and contribution specifications.