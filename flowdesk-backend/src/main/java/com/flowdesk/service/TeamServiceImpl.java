package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * TeamServiceImpl — Member 2
 * Stub implementation for Phase 1. Controller returns mock data directly.
 * Phase 2: will implement full team management with invite-by-email.
 */
@Service
public class TeamServiceImpl implements TeamService {

    private final TeamMemberRepository teamMemberRepository;

    public TeamServiceImpl(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    @Override
    public List<TeamMemberResponse> getProjectMembers(Long projectId) {
        // Phase 2: query repo, join with users table, map to DTOs
        throw new UnsupportedOperationException("Phase 2: implement");
    }

    @Override
    public TeamMemberResponse addMemberToProject(Long projectId, Long userId, String role) {
        // Phase 2: create TeamMember record, handle invite-by-email
        throw new UnsupportedOperationException("Phase 2: implement");
    }

    @Override
    public void removeMemberFromProject(Long projectId, Long userId) {
        // Phase 2: delete TeamMember record
        throw new UnsupportedOperationException("Phase 2: implement");
    }

    @Override
    public TeamMemberResponse changeMemberRole(Long projectId, Long userId, String newRole) {
        // Phase 2: update role_in_project
        throw new UnsupportedOperationException("Phase 2: implement");
    }
}
