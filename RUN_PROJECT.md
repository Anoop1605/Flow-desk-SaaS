# FlowDesk - Complete Setup & Run Guide

## ✅ What Was Fixed

1. **Backend JWT Error** - JwtFilter now gracefully handles expired/invalid tokens (returns 401 instead of 500)
2. **Logout Button** - Added dropdown menu in top-right corner with Profile & Logout options
3. **React Key Warning** - Fixed duplicate navigation keys

---

## 🚀 Running the Project (Step-by-Step)

### **Step 1: Clear Your Browser Local Storage**
This removes the old authentication token that was persisted before we wiped the database.

1. Open `http://localhost:5173` in your browser
2. Press **F12** to open Developer Tools
3. Go to **Application** tab (or **Storage** in Firefox)
4. Click **Local Storage** → `http://localhost:5173`
5. Delete all entries (or press Ctrl+A then Delete)
6. **Close and refresh** the page

---

### **Step 2: Start PostgreSQL Database**

```bash
# Make sure PostgreSQL 17 is running
# Windows: Check Services → PostgreSQL or run:
pg_ctl -D "C:\Program Files\PostgreSQL\17\data" start

# Or use: net start postgresql-x64-17
```

---

### **Step 3: Rebuild the Database**

```bash
cd "c:\Users\Mohit Patil\Desktop\fsd_project\Flow-desk-SaaS"

# Drop existing database and recreate from migration scripts
PGPASSWORD="postgres" psql -U postgres -h localhost -p 5432 -c "DROP DATABASE IF EXISTS flowdesk;"
PGPASSWORD="postgres" psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE flowdesk;"

# Create the pgcrypto extension
PGPASSWORD="postgres" psql -U postgres -h localhost -p 5432 -d flowdesk -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

---

### **Step 4: Start the Backend**

In **terminal/PowerShell**, navigate to backend directory:

```bash
cd "c:\Users\Mohit Patil\Desktop\fsd_project\Flow-desk-SaaS\flowdesk-backend"

# Run Spring Boot (via Maven)
mvn spring-boot:run

# Or if using IntelliJ: Right-click FlowDeskApplication.java → Run
```

**✅ Backend should start on http://localhost:8080**

---

### **Step 5: Start the Frontend**

In **another terminal/PowerShell**:

```bash
cd "c:\Users\Mohit Patil\Desktop\fsd_project\Flow-desk-SaaS\flowdesk-frontend"

# Install dependencies (only first time)
npm install

# Run Vite dev server
npm run dev
```

**✅ Frontend should start on http://localhost:5173**

---

### **Step 6: Register & Login**

1. **Open browser**: http://localhost:5173
2. **Click "Sign Up"** (bottom of login screen)
3. **Fill in registration form**:
   - Name: Any name
   - Email: `mohitpatil1024@gmail.com` (or any email)
   - Password: Any strong password (min 8 chars recommended)
   - Click **Register**

4. **You'll be logged in automatically** → Dashboard appears

---

### **Step 7: Test the Logout Button**

1. **Look at top-right corner** → You'll see your **initials avatar**
2. **Click the avatar** → Dropdown menu appears with:
   - Your name & email
   - "View Profile" link
   - "Logout" button (in red)
3. **Click "Logout"** → You're logged out and sent to login page

---

## 🎯 Testing Checklist

- [ ] **Cleared browser local storage** before running
- [ ] **PostgreSQL server** is running
- [ ] **Backend** started on port 8080
- [ ] **Frontend** started on port 5173
- [ ] **No red errors** in browser console (F12)
- [ ] **No red errors** in backend terminal
- [ ] **Can register** a new account
- [ ] **Can login** successfully
- [ ] **Logout dropdown** appears in top-right
- [ ] **Logout button works** and redirects to login

---

## 🚨 If You Still See Errors

### **Error: "User not found with email: mohitpatil1024@gmail.com"**
→ **Solution**: Clear local storage (Step 1) and refresh browser

### **Error: "Port 8080 already in use"**
→ **Solution**: Kill existing Java process:
```bash
taskkill /F /IM java.exe
```

### **Error: "Cannot connect to database"**
→ **Solution**: 
- Start PostgreSQL: `net start postgresql-x64-17`
- Verify connection: `psql -U postgres -h localhost`

### **Error: "React key warning in console"**
→ **Solution**: This is now fixed! No action needed.

---

## 📝 Project Credentials

**Database**: 
- Host: `localhost`
- Port: `5432`
- Database: `flowdesk`
- User: `postgres`
- Password: `postgres`

**Backend API**: `http://localhost:8080`

**Frontend**: `http://localhost:5173`

---

## ✨ Key Features to Try

1. **Register & Login** - Create new account
2. **Logout** - Click avatar → Logout
3. **Create Project** - Dashboard → New Project
4. **View Projects** - Projects page
5. **Manage Team** - Team page
6. **View Tasks** - My Tasks page

---

**Happy coding! 🚀**
