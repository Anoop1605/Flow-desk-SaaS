package com.flowdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class TaskStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    // ── Constructors ──
    public TaskStatusUpdateRequest() {
    }

    public TaskStatusUpdateRequest(String status) {
        this.status = status;
    }

    // ── Getters & Setters ──
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
