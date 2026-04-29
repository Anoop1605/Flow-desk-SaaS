package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.entity.TeamMember;
import com.flowdesk.repository.TeamMemberRepository;
import com.flowdesk.repository.UserRepository;
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
    private final UserRepository userRepository;

    public TeamServiceImpl(TeamMemberRepository teamMemberRepository, UserRepository userRepository) {
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<TeamMemberResponse> getProjectMembers(Long projectId) {
        return teamMemberRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TeamMemberResponse addMemberToProject(Long projectId, Long userId, String role) {
        if (teamMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
            throw new RuntimeException("User is already a member of this project");
        }

        TeamMember member = new TeamMember();
        member.setProjectId(projectId);
        member.setUserId(userId);
        member.setRoleInProject(com.flowdesk.enums.ProjectRole.valueOf(role));
        
        TeamMember saved = teamMemberRepository.save(member);
        return mapToResponse(saved);
    }

    @Override
    public void removeMemberFromProject(Long projectId, Long userId) {
        TeamMember member = teamMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        teamMemberRepository.delete(member);
    }

    @Override
    public TeamMemberResponse changeMemberRole(Long projectId, Long userId, String newRole) {
        TeamMember member = teamMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setRoleInProject(com.flowdesk.enums.ProjectRole.valueOf(newRole));
        TeamMember saved = teamMemberRepository.save(member);
        return mapToResponse(saved);
    }

    private TeamMemberResponse mapToResponse(TeamMember member) {
        TeamMemberResponse response = new TeamMemberResponse();
        response.setId(member.getId());
        response.setUserId(member.getUserId());
        response.setRoleInProject(member.getRoleInProject().name());
        response.setJoinedAt(member.getJoinedAt());
        
        userRepository.findById(member.getUserId()).ifPresent(user -> {
            response.setUserName(user.getName());
            response.setUserEmail(user.getEmail());
        });
        
        return response;
    }
}
