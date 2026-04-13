package com.flowdesk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Check if email service is properly configured
     */
    public boolean isEmailConfigured() {
        return mailSender != null && fromEmail != null && !fromEmail.isBlank();
    }

    /**
     * Send invitation email to a member
     * IMPORTANT: This will send REAL emails if configured, or log a warning if not configured
     */
    public boolean sendInvitationEmail(String toEmail, String invitedByName, String organizationName, String invitationToken) {
        String link = frontendUrl + "/accept-invite?token=" + invitationToken;
        if (!isEmailConfigured()) {
            logger.warn("\n=======================================================\n" +
                        "⚠️  EXTERNAL EMAIL NOT CONFIGURED IN application.properties\n" +
                        "An email would normally be sent to: {}\n" +
                        "To test the invite flow locally, open this link:\n" +
                        "{}\n" +
                        "=======================================================", 
                toEmail, link);
            return false;
        }

        if (toEmail == null || toEmail.isBlank()) {
            logger.error("Invalid email address: {}", toEmail);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail.trim());
            message.setSubject("You're invited to FlowDesk - " + organizationName);
            message.setText(buildInvitationEmailBody(invitedByName, organizationName, toEmail, invitationToken));

            mailSender.send(message);
            logger.info("✅ INVITATION EMAIL SENT SUCCESSFULLY");
            logger.info("   To: {}", toEmail);
            logger.info("   From: {}", fromEmail);
            logger.info("   Organization: {}", organizationName);
            return true;
        } catch (Exception e) {
            logger.error("❌ FAILED TO SEND INVITATION EMAIL", e);
            logger.error("   To: {}", toEmail);
            logger.error("   Error: {}", e.getMessage());
            // Don't throw exception - continue with member creation even if email fails
            return false;
        }
    }

    private String buildInvitationEmailBody(String invitedByName, String organizationName, String email, String invitationToken) {
        return String.format(
            "Hello,\n\n" +
            "%s has invited you to join their team on FlowDesk!\n\n" +
            "Organization: %s\n" +
            "Email: %s\n\n" +
            "To get started and set up your account, click the link below:\n\n" +
            "%s/accept-invite?token=%s\n\n" +
            "Let's get things done together!\n\n" +
            "Best regards,\n" +
            "FlowDesk Team",
            invitedByName, organizationName, email, frontendUrl, invitationToken
        );
    }

    /**
     * Send welcome email to new users
     */
    public boolean sendWelcomeEmail(String toEmail, String userName) {
        if (!isEmailConfigured()) {
            logger.warn("⚠️  EMAIL NOT CONFIGURED - Welcome email would be sent to: {}", toEmail);
            return false;
        }

        if (toEmail == null || toEmail.isBlank()) {
            logger.error("Invalid email address: {}", toEmail);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail.trim());
            message.setSubject("Welcome to FlowDesk!");
            message.setText(String.format(
                "Hello %s,\n\n" +
                "Welcome to FlowDesk! Get ready to organize your work and collaborate with your team.\n\n" +
                "Start by:\n" +
                "1. Creating your first project\n" +
                "2. Inviting team members\n" +
                "3. Organizing tasks with Kanban boards\n\n" +
                "Visit us at: %s\n\n" +
                "Best regards,\n" +
                "FlowDesk Team",
                userName, frontendUrl
            ));

            mailSender.send(message);
            logger.info("✅ WELCOME EMAIL SENT SUCCESSFULLY to: {}", toEmail);
            return true;
        } catch (Exception e) {
            logger.error("❌ FAILED TO SEND WELCOME EMAIL to: {}", toEmail, e);
            return false;
        }
    }
}
