package com.flowdesk.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for team member data — Member 2
 */
public class TeamMemberResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String userEmail;
    private String roleInProject;
    private LocalDateTime joinedAt;
    
    // For handling newly invited users
    private String tempPassword;
    private String loginLink;

    public TeamMemberResponse() {
    }

    public TeamMemberResponse(Long id, Long userId, String userName, String userAvatar, String userEmail,
                              String roleInProject, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.userEmail = userEmail;
        this.roleInProject = roleInProject;
        this.joinedAt = joinedAt;
    }

    // ── Getters & Setters ──
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getRoleInProject() { return roleInProject; }
    public void setRoleInProject(String roleInProject) { this.roleInProject = roleInProject; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public String getTempPassword() { return tempPassword; }
    public void setTempPassword(String tempPassword) { this.tempPassword = tempPassword; }

    public String getLoginLink() { return loginLink; }
    public void setLoginLink(String loginLink) { this.loginLink = loginLink; }
}
