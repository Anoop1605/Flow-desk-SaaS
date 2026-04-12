package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.TeamMember;
import com.flowdesk.entity.User;
import com.flowdesk.enums.GlobalRole;
import com.flowdesk.repository.TeamMemberRepository;
import com.flowdesk.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/**
 * TeamServiceImpl — Member 2
 * Stub implementation for Phase 1. Controller returns mock data directly.
 * Phase 2: will implement full team management with invite-by-email.
 */
@Service
public class TeamServiceImpl implements TeamService {

    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    public TeamServiceImpl(
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ActivityLogService activityLogService) {
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.activityLogService = activityLogService;
    }

    @Override
    public List<TeamMemberResponse> getOrganizationMembers(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapUserToTeamResponse)
                .toList();
    }

    @Override
    public TeamMemberResponse inviteMemberByEmail(String email, String role, Long organizationId, Long actorUserId,
            String actorUserName) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        GlobalRole targetRole = mapInviteRole(role);

        User user = userRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    if (existing.getOrganization() == null
                            || !organizationId.equals(existing.getOrganization().getId())) {
                        throw new RuntimeException("This email belongs to another organization");
                    }
                    existing.setRole(targetRole);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    Organization org = new Organization();
                    org.setId(organizationId);

                    String namePart = normalizedEmail.split("@")[0].replace('.', ' ').replace('_', ' ');
                    String displayName = namePart.isBlank() ? "New Member" : toTitleCase(namePart);

                    User created = new User();
                    created.setEmail(normalizedEmail);
                    created.setName(displayName);
                    created.setPassword(passwordEncoder.encode("TempPassword@123"));
                    created.setRole(targetRole);
                    created.setOrganization(org);
                    return userRepository.save(created);
                });

        activityLogService.log(
                "MEMBER_INVITED",
                actorUserName + " invited " + user.getEmail() + " to the workspace",
                actorUserId,
                actorUserName,
                organizationId,
                user.getId(),
                "USER");

        return mapUserToTeamResponse(user);
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

    private TeamMemberResponse mapUserToTeamResponse(User user) {
        TeamMemberResponse response = new TeamMemberResponse();
        response.setId(user.getId());
        response.setUserId(user.getId());
        response.setUserName(user.getName());
        response.setUserEmail(user.getEmail());
        response.setRoleInProject(user.getRole().name());
        response.setJoinedAt(user.getCreatedAt());
        return response;
    }

    private GlobalRole mapInviteRole(String role) {
        if (role == null || role.isBlank()) {
            return GlobalRole.ORGANIZATION_MEMBER;
        }

        return switch (role.toUpperCase(Locale.ROOT)) {
            case "MANAGER", "ORGANIZATION_OWNER" -> GlobalRole.ORGANIZATION_OWNER;
            case "MEMBER", "ORGANIZATION_MEMBER" -> GlobalRole.ORGANIZATION_MEMBER;
            default -> GlobalRole.ORGANIZATION_MEMBER;
        };
    }

    private String toTitleCase(String value) {
        String[] words = value.trim().split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                builder.append(word.substring(1).toLowerCase(Locale.ROOT));
            }
        }
        return builder.toString();
    }
}
