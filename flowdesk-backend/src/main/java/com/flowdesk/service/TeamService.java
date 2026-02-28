package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;

import java.util.List;

/**
 * TeamService interface — Member 2
 * Defines the contract for team/member management operations.
 * Phase 2: implementations will include invite-by-email and role changes.
 */
public interface TeamService {

    List<TeamMemberResponse> getProjectMembers(Long projectId);

    TeamMemberResponse addMemberToProject(Long projectId, Long userId, String role);

    void removeMemberFromProject(Long projectId, Long userId);

    TeamMemberResponse changeMemberRole(Long projectId, Long userId, String newRole);
}
