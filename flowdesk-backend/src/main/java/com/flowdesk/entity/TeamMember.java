package com.flowdesk.entity;

import com.flowdesk.enums.ProjectRole;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * TeamMember entity — Member 2
 * Join table mapping users to projects with project-level roles.
 */
@Entity
@Table(name = "team_members")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_project", nullable = false, length = 20)
    private ProjectRole roleInProject = ProjectRole.MEMBER;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    // ── Lifecycle Callbacks ──
    @PrePersist
    protected void onCreate() {
        this.joinedAt = LocalDateTime.now();
    }

    // ── Constructors ──
    public TeamMember() {
    }

    public TeamMember(Long userId, Long projectId, ProjectRole roleInProject) {
        this.userId = userId;
        this.projectId = projectId;
        this.roleInProject = roleInProject;
    }

    // ── Getters & Setters ──
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public ProjectRole getRoleInProject() {
        return roleInProject;
    }

    public void setRoleInProject(ProjectRole roleInProject) {
        this.roleInProject = roleInProject;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
