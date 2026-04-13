package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;

import java.util.List;

/**
 * TeamService interface — Member 2
 * Defines the contract for team/member management operations.
 * Phase 2: implementations will include invite-by-email and role changes.
 */
public interface TeamService {

    List<TeamMemberResponse> getOrganizationMembers(Long organizationId);

    TeamMemberResponse inviteMemberByEmail(String email, String role, Long organizationId, Long actorUserId,
            String actorUserName);

    TeamMemberResponse updateOrganizationRole(Long organizationId, Long userId, String newRole);

    void removeOrganizationMember(Long organizationId, Long userId);

    List<TeamMemberResponse> getProjectMembers(Long projectId);

    TeamMemberResponse addMemberToProject(Long projectId, Long userId, String role);

    void removeMemberFromProject(Long projectId, Long userId);

    TeamMemberResponse changeMemberRole(Long projectId, Long userId, String newRole);
}
