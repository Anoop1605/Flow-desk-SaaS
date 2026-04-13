# FlowDesk - PostgreSQL Setup Guide

## What Changed
Your backend now uses **PostgreSQL** instead of H2 in-memory database.
- Database name: `flowdesk`
- Host: `localhost:5432`
- User: `postgres`
- Password: Set via environment variable (secure, not in Git)

---

## Quick Setup (3 Steps)

### Step 1: Create PostgreSQL Database

**Option A - Automated (Recommended):**
```cmd
cd "c:/Users/Mohit Patil/Desktop/fsd_project/Flow-desk-SaaS"
setup-database.bat
```
It will prompt for postgres password and create everything.

**Option B - Manual:**
```bash
psql -U postgres -h localhost -p 5432
```
Then inside psql:
```sql
CREATE DATABASE flowdesk;
\c flowdesk
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q
```

### Step 2: Verify Database Setup
```bash
cd "c:/Users/Mohit Patil/Desktop/fsd_project/Flow-desk-SaaS"
psql -U postgres -h localhost -p 5432 -d flowdesk -f verify-postgres.sql
```

Expected output should show:
- Connected to: flowdesk
- Extension: pgcrypto
- Two sample UUIDs
- Status: "PostgreSQL is ready for FlowDesk!"

### Step 3: Set Password Environment Variable

**In the SAME terminal where you'll run the backend**, run ONE of these:

**Git Bash / WSL:**
```bash
export FLOWDESK_DB_PASSWORD='your_postgres_password'
```

**Command Prompt (cmd):**
```cmd
set FLOWDESK_DB_PASSWORD=your_postgres_password
```

**PowerShell:**
```powershell
$env:FLOWDESK_DB_PASSWORD="your_postgres_password"
```

⚠️ **IMPORTANT:** Replace `your_postgres_password` with your actual postgres password!

---

## Running the Backend

**Option A - Using Script (Recommended):**
```bash
cd "c:/Users/Mohit Patil/Desktop/fsd_project/Flow-desk-SaaS/flowdesk-backend"
start-backend.bat
```

**Option B - Manual:**
```bash
cd "c:/Users/Mohit Patil/Desktop/fsd_project/Flow-desk-SaaS/flowdesk-backend"
mvn spring-boot:run
```

---

## How to Verify It's Working

### 1. Check Backend Logs
Look for these lines in the Maven output:
```
HikariPool-1 - Added connection conn0: url=jdbc:postgresql://localhost:5432/flowdesk
Tomcat initialized with port 8080
Started FlowDeskApplication in X.XXX seconds
```

### 2. Check Database Tables Were Created
```bash
psql -U postgres -h localhost -p 5432 -d flowdesk -c "\dt"
```

Should show tables like: `comments`, `projects`, `tasks`, `team_members`

### 3. Test API
```bash
curl http://localhost:8080/api/projects
```

Should return JSON (might be empty array `[]` if no data yet).

---

## Common Errors & Fixes

### Error: "password authentication failed for user postgres"
**Fix:** Your `FLOWDESK_DB_PASSWORD` doesn't match the actual postgres password.
- Check your postgres password
- Re-run Step 3 with correct password

### Error: "database 'flowdesk' does not exist"
**Fix:** Run Step 1 again to create the database.

### Error: "Port 8080 was already in use"
**Fix:** The backend is already running. Kill it:
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```
Or just use `start-backend.bat` - it auto-kills the old process.

### Error: "relation does not exist"
**Fix:** Tables weren't created. Check:
1. Is `spring.jpa.hibernate.ddl-auto=update` in application.properties?
2. Did the backend fully start without errors?
3. Run `psql -U postgres -d flowdesk -c "\dt"` to see tables.

---

## Switching Back to H2 (If Needed)

If you need to quickly switch back to H2 for testing:

Edit `flowdesk-backend/src/main/resources/application.properties`:
```properties
# Comment out PostgreSQL
# spring.datasource.url=jdbc:postgresql://localhost:5432/flowdesk
# spring.datasource.driver-class-name=org.postgresql.Driver
# spring.datasource.username=postgres
# spring.datasource.password=${FLOWDESK_DB_PASSWORD}
# spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Uncomment H2
spring.datasource.url=jdbc:h2:mem:flowdesk
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

No env var needed for H2.

---

## Files Modified

✅ **Modified:**
- `flowdesk-backend/src/main/resources/application.properties` - Switched to PostgreSQL

✅ **Created:**
- `setup-postgres.sql` - Database creation script
- `verify-postgres.sql` - Connection verification script
- `setup-database.bat` - Automated database setup
- `flowdesk-backend/start-backend.bat` - Updated with password check
- `POSTGRES-SETUP.md` - This guide

---

## Summary Checklist

- [ ] PostgreSQL service is running (`netstat -ano | findstr :5432`)
- [ ] Database `flowdesk` exists (Step 1)
- [ ] Extension `pgcrypto` installed (Step 1)
- [ ] Verification script passes (Step 2)
- [ ] Password env var set in terminal (Step 3)
- [ ] Backend starts successfully
- [ ] Tables created (`\dt` shows tables)
- [ ] API responds (`curl http://localhost:8080/api/projects`)

If all checked ✅, PostgreSQL is fully working!

---

## Need Help?

Run the verification script to diagnose:
```bash
psql -U postgres -h localhost -p 5432 -d flowdesk -f verify-postgres.sql
```

This outputs your database status and confirms UUID support.
