package com.flowdesk.dto;

import lombok.Data;

@Data
public class AcceptInviteRequest {
    private String token;
    private String name;
    private String password;
}
