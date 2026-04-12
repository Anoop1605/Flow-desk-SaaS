package com.flowdesk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
