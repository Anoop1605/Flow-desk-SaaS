package com.flowdesk.controller;

import com.flowdesk.dto.InviteMemberRequest;
import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class TeamController {

    private final TeamService teamService;

    @GetMapping("/members")
    public ResponseEntity<List<TeamMemberResponse>> getOrganizationMembers(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(teamService.getOrganizationMembers(orgId));
    }

    @PostMapping("/invite")
    public ResponseEntity<TeamMemberResponse> inviteMember(@RequestBody InviteMemberRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();

        TeamMemberResponse response = teamService.inviteMemberByEmail(
                request.getEmail(),
                request.getRole(),
                orgId,
                userDetails.getUser().getId(),
                userDetails.getUser().getName());

        return ResponseEntity.ok(response);
    }
}
