# Email Invitations Setup Guide

## Overview

Your FlowDesk application now supports **real email invitations** for team members. When you invite someone to your workspace, they'll receive an email with:
- Login credentials (email + temporary password)
- Link to access FlowDesk
- Instructions on how to get started

## Current Status

**Email Service Status**: ✅ Enabled with graceful fallback
- If email is NOT configured in `application.properties`, invitations still work but emails are NOT sent (logged as warning)
- Once you configure email below, invitations will be sent immediately

## Option 1: Gmail SMTP (Recommended for Testing)

### Step 1: Generate Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already enabled)
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password - **copy this**

### Step 2: Update `application.properties`

Edit `flowdesk-backend/src/main/resources/application.properties` and uncomment/update:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**Example:**
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=john.doe@gmail.com
spring.mail.password=abcd efgh ijkl mnop
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**Frontend URL** (already set):
```properties
app.frontend.url=http://localhost:5173
```

### Step 3: Restart Backend

```bash
cd flowdesk-backend
mvn spring-boot:run
```

### Step 4: Test Email Invitations

1. Go to Team page (http://localhost:5173/team)
2. Click "Invite Member"
3. Enter a team member's email and role
4. Click "Add Member"
5. ✅ They should receive an email with login credentials

## Option 2: Generic SMTP (Alternative)

Use any SMTP server (Office 365, SendGrid, Mailgun, etc.):

```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-email@domain.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## What Email Templates Are Sent

### 1. Invitation Email
Sent when inviting a new member or changing existing member's role:
- Project: Organization name
- Recipient: Team member's email
- Contains: Temporary password, login link, setup instructions

### 2. Welcome Email (Optional)
Currently sent to new users at registration

## Temporary Password

When a new member is invited, they receive a **temporary password**: `TempPassword@123`

They should:
1. Login with their email + temporary password
2. Go to Profile page
3. Update their password to something secure

## Troubleshooting

### Email Not Sending?

1. **Check logs** - Look for messages like:
   - `"Invitation email sent successfully to: user@example.com"` ✅
   - `"Email service not configured. Invitation email would be sent to: user@example.com"` ⚠️
   - `"Failed to send invitation email to: user@example.com"` ❌

2. **Verify Configuration**:
   ```bash
   # Restart the backend
   cd flowdesk-backend
   mvn clean spring-boot:run
   ```

3. **Test Connection** (Gmail users):
   - Verify app password is correct (check Gmail Security > App passwords)
   - Ensure 2-Factor Authentication is enabled
   - Key note: Use **app password**, not your regular Gmail password

4. **Network/Firewall**:
   - Ensure port 587 (TLS) is not blocked by firewall
   - Some corporate networks block SMTP

### Emails Go to Spam?

- This is normal for development/testing
- Check spam/junk folder
- For production, use a proper transactional email service (SendGrid, Mailgun, etc.)

## Frontend Changes

**InviteMemberModal.jsx**
- Removed "demo mode" warning
- Now shows: "An invitation email with login credentials will be sent..."
- Status badge shows "Saving..." while processing

**App.jsx - Kanban Board Navigation**
- Added helpful "Select project" badge when no project is selected
- Displays tooltip: "Select a project first to view its Kanban board"
- Guides users to select a project before accessing Kanban Board

## Backend Changes

**New File: EmailService.java**
- Sends invitation and welcome emails
- Gracefully handles missing email configuration
- Customizable email templates via `buildInvitationEmailBody()`

**Updated: TeamServiceImpl.java**
- Now calls `emailService.sendInvitationEmail()` when inviting members
- Retrieves organization name for personalized emails
- Includes temporary password in email

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Go to Team page (requires owner role)
- [ ] Click "Invite Member"
- [ ] Enter email and select role
- [ ] Click "Add Member"
- [ ] Verify success toast appears
- [ ] Check if email received (or logs for "not configured" message)
- [ ] Test Kanban Board link:
  - [ ] Click Kanban Board without selecting project - should show "Select project" badge
  - [ ] Click on a project
  - [ ] Click Kanban Board - should load that project's Kanban view

## Next Steps (Optional)

1. **Production Email Service**: Replace JavaMail with SendGrid/Mailgun for better reliability
2. **Email Verification**: Add email verification for new invites
3. **Resend Invitation**: Add button to resend invitation emails
4. **Email Templates**: Use HTML email templates instead of plain text
5. **Rate Limiting**: Prevent invitation spam

---

**Questions?** Check the logs with `VITE_API_URL=http://localhost:8080 npm run dev` to see detailed error messages.
