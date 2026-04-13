package com.flowdesk.dto;

import com.flowdesk.enums.GlobalRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for login and registration.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private GlobalRole role;
    private Long organizationId;
    private String avatar;
}
