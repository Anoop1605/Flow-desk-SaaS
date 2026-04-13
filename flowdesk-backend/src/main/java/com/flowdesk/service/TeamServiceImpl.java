package com.flowdesk.service;

import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.TeamMember;
import com.flowdesk.entity.User;
import com.flowdesk.enums.GlobalRole;
import com.flowdesk.repository.TeamMemberRepository;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.repository.OrganizationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * TeamServiceImpl — Full team management with real email invitations
 * Sends invitation emails when members are invited to the organization.
 */
@Service
public class TeamServiceImpl implements TeamService {

    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final EmailService emailService;

    public TeamServiceImpl(
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            ActivityLogService activityLogService,
            EmailService emailService) {
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.activityLogService = activityLogService;
        this.emailService = emailService;
    }

    @Override
    public List<TeamMemberResponse> getOrganizationMembers(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapUserToTeamResponse)
                .toList();
    }

    @Override
    public TeamMemberResponse updateOrganizationRole(Long organizationId, Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOrganization() == null || !user.getOrganization().getId().equals(organizationId)) {
            throw new RuntimeException("User does not belong to this organization");
        }
        
        GlobalRole newRole = mapInviteRole(role);
        user.setRole(newRole);
        user = userRepository.save(user);
        return mapUserToTeamResponse(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void removeOrganizationMember(Long organizationId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOrganization() == null || !user.getOrganization().getId().equals(organizationId)) {
            throw new RuntimeException("User does not belong to this organization");
        }
        
        // Let's set organization to null to logically detach without breaking task assignees/creators
        user.setOrganization(null);
        userRepository.save(user);
    }

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    @Override
    public TeamMemberResponse inviteMemberByEmail(String email, String role, Long organizationId, Long actorUserId,
            String actorUserName) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new RuntimeException("Invalid email format");
        }

        GlobalRole targetRole = mapInviteRole(role);
        
        String invitationToken = java.util.UUID.randomUUID().toString();
        String securePlaceholderPassword = java.util.UUID.randomUUID().toString();

        User user = userRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    if (existing.getOrganization() == null
                            || !organizationId.equals(existing.getOrganization().getId())) {
                        throw new RuntimeException("This email belongs to another organization");
                    }
                    existing.setRole(targetRole);
                    existing.setInvitationToken(invitationToken);
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
                    created.setPassword(passwordEncoder.encode(securePlaceholderPassword));
                    created.setRole(targetRole);
                    created.setOrganization(org);
                    created.setInvitationToken(invitationToken);
                    return userRepository.save(created);
                });

        // Send invitation email with organization name
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        emailService.sendInvitationEmail(
                normalizedEmail,
                actorUserName,
                org.getName() != null ? org.getName() : "Our Team",
                invitationToken
        );

        activityLogService.log(
                "MEMBER_INVITED",
                actorUserName + " invited " + user.getEmail() + " to the workspace",
                actorUserId,
                actorUserName,
                organizationId,
                user.getId(),
                "USER");

        TeamMemberResponse response = mapUserToTeamResponse(user);
        response.setTempPassword(null);
        response.setLoginLink(null);

        return response;
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
            response.setUserAvatar(user.getAvatar());
        });

        return response;
    }

    private TeamMemberResponse mapUserToTeamResponse(User user) {
        TeamMemberResponse response = new TeamMemberResponse();
        response.setId(user.getId());
        response.setUserId(user.getId());
        response.setUserName(user.getName());
        response.setUserAvatar(user.getAvatar());
        response.setUserEmail(user.getEmail());
        response.setRoleInProject(user.getRole().name());
        response.setJoinedAt(user.getCreatedAt());
        return response;
    }

    private String generateRandomPassword() {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
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
