package com.flowdesk.controller;

import com.flowdesk.dto.AcceptInviteRequest;
import com.flowdesk.dto.AuthResponse;
import com.flowdesk.dto.LoginRequest;
import com.flowdesk.dto.PasswordChangeRequest;
import com.flowdesk.dto.ProfileUpdateRequest;
import com.flowdesk.dto.RegisterRequest;
import com.flowdesk.entity.User;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication operations.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final com.flowdesk.repository.OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        log.info("Received registration request for email: {}", request.getEmail());
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Registration failed: Email already exists - {}", request.getEmail());
                return ResponseEntity.badRequest().body("Email already exists");
            }

            com.flowdesk.entity.Organization org = null;
            if (request.getOrganizationName() != null && !request.getOrganizationName().isEmpty()) {
                log.info("Processing organization: {}", request.getOrganizationName());
                org = organizationRepository.findByName(request.getOrganizationName())
                        .orElseGet(() -> {
                            log.info("Creating new organization: {}", request.getOrganizationName());
                            return organizationRepository.save(
                                    com.flowdesk.entity.Organization.builder()
                                            .name(request.getOrganizationName())
                                            .build());
                        });
            }

            log.info("Creating user for email: {}", request.getEmail());
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .name(request.getName())
                    .role(com.flowdesk.enums.GlobalRole.ORGANIZATION_OWNER)
                    .organization(org)
                    .build();

            log.info("Saving user to repository...");
            userRepository.save(user);
            log.info("User saved successfully with ID: {}", user.getId());

            log.info("Generating JWT token...");
            String token = jwtUtil.generateToken(new CustomUserDetails(user));
            log.info("Token generated successfully");

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
.avatar(user.getAvatar())
                    .build());
        } catch (Exception e) {
            log.error("CRITICAL ERROR during registration: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
.avatar(user.getAvatar())
                .build());
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvite(@RequestBody AcceptInviteRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body("Token is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }
        
        java.util.Optional<User> optUser = userRepository.findByInvitationToken(request.getToken());
        if (optUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired invitation token");
        }

        User user = optUser.get();
        user.setInvitationToken(null);
        user.setName(request.getName() != null && !request.getName().isBlank() ? request.getName() : user.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Auto-login after password set
        String token = jwtUtil.generateToken(new CustomUserDetails(user));
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
.avatar(user.getAvatar())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return ResponseEntity.ok(AuthResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
.avatar(user.getAvatar())
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String firstName = request.getFirstName() != null ? request.getFirstName().trim() : "";
        String lastName = request.getLastName() != null ? request.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        if (fullName.isBlank()) {
            return ResponseEntity.badRequest().body("Name cannot be empty");
        }

        user.setName(fullName);
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            user.setAvatar(request.getAvatar());
        }
        userRepository.save(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
.avatar(user.getAvatar())
                .build());
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Current password is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body("New password is required");
        }
        if (request.getConfirmPassword() == null || !request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Password confirmation does not match");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
    }
}
