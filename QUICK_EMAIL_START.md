# ⚡ QUICK START: Enable Real Email Invitations

## Option 1: Test Without Email (👈 START HERE)

1. **Start Backend**:
   ```bash
   cd flowdesk-backend
   mvn clean spring-boot:run
   ```

2. **Check Logs** (look for):
   ```
   ⚠️ EMAIL NOT CONFIGURED - Member would receive invitation email
   ```

3. **Start Frontend**:
   ```bash
   cd flowdesk-frontend
   npm run dev
   ```

4. **Test Invitation**:
   - Go to http://localhost:5173/team
   - Click "Invite Member"
   - Enter `test@example.com`
   - Click "Add Member"
   - ✅ Member is created (even though email wasn't sent)
   - ✅ Logs show warning but NO errors
   - Member can later log in with temp password: `TempPassword@123`

---

## Option 2: Enable Gmail (Real Emails ✅)

### Step 1: Create Gmail App Password
1. Go to https://myaccount.google.com/security
2. Find **"App passwords"** link (requires 2-Factor Auth enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device)
4. Google generates a 16-character password
5. **Copy it** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Configuration
Edit: `flowdesk-backend/src/main/resources/application.properties`

Find and uncomment:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR-EMAIL@gmail.com
spring.mail.password=YOUR-APP-PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**Example**:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=john.doe@gmail.com
spring.mail.password=abcd efgh ijkl mnop
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### Step 3: Restart Backend
```bash
cd flowdesk-backend
mvn clean spring-boot:run
```

Check logs for:
```
✅ INVITATION EMAIL SENT SUCCESSFULLY
   To: colleague@company.com
   From: john.doe@gmail.com
```

### Step 4: Test Real Email
1. Go to Team page
2. Invite `colleague@company.com`
3. **Email arrives in 1-2 minutes** with:
   - Login credentials
   - Temporary password
   - Login link

---

## Verify It's Working

### ✅ Email Configured Successfully
```bash
# Backend logs show:
✅ INVITATION EMAIL SENT SUCCESSFULLY
   To: collaborator@gmail.com
   From: myemail@gmail.com
   Organization: My Company
```

### ⚠️ Email Not Configured (Default)
```bash
# Backend logs show:
⚠️ EMAIL NOT CONFIGURED - Member would receive invitation email
```
**This is FINE** - members can still be created and will log in with temp password

### ❌ Email Configuration Error
```bash
# Backend logs show:
❌ FAILED TO SEND INVITATION EMAIL
   To: bad-email@domain.com
   Error: Invalid credentials / Connection refused
```
**Check**:
- Email configuration in `application.properties`
- Gmail app password is correct (not regular password)
- 2-Factor Authentication is enabled on Gmail

---

## What Emails Include

### Invitation Email
```
Hello,

Jane Smith has invited you to join their team on FlowDesk!

Organization: Acme Corp
Email: collaborator@gmail.com
Temporary Password: TempPassword@123

To get started:
1. Visit: http://localhost:5173/login
2. Log in with your email and temporary password
3. Update your password in your profile settings

Let's get things done together!

Best regards,
FlowDesk Team
```

---

## Kanban Board Fix

**Before**: Clicking "Kanban Board" selected "Projects" page ❌

**After**: 
- ✅ "Kanban Board" link only appears after you select a project
- ✅ Click on any project first
- ✅ Then "Kanban Board" menu item appears
- ✅ Clicking it takes you to that project's Kanban board

**Test**:
1. Go to Projects
2. Click a project
3. "Kanban Board" should now appear in sidebar
4. Click it → Should show Kanban board (not Projects page)

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not sending but code shows success | Add email configuration to `application.properties` |
| Gmail says "password incorrect" | Use **App Password**, not your Gmail password |
| Can't find "App passwords" in Gmail | Enable 2-Factor Authentication first |
| Emails go to spam | Normal for Gmail testing - check spam folder |
| Kanban Board link doesn't appear | Select a project first |
| Kanban Board clicks but shows Projects page | Clear browser cache (Ctrl+Shift+Delete) |

---

## Quick Rebuild & Test

```bash
# Terminal 1: Backend
cd flowdesk-backend
mvn clean spring-boot:run

# Terminal 2: Frontend
cd flowdesk-frontend
npm run dev

# Terminal 3: Check logs (optional)
tail -f flowdesk-backend.log | grep -i "email\|mail"
```

Then open http://localhost:5173 and test!

---

## Production Checklist

- [ ] Email configuration in environment variables (not hard-coded)
- [ ] Use transactional email service (SendGrid/Mailgun, not Gmail)
- [ ] HTML email templates
- [ ] Email verification for new invites
- [ ] Unsubscribe links
- [ ] Rate limiting on invitations
- [ ] Error handling & retry logic

---

**Ready?** Start with Option 1 (no email), then upgrade to Option 2 (real emails) once you confirm it works! 🚀
