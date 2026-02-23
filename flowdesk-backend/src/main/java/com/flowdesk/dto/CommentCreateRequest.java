package com.flowdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentCreateRequest {

    @NotBlank(message = "Content is required")
    private String content;

    // ── Constructors ──
    public CommentCreateRequest() {
    }

    public CommentCreateRequest(String content) {
        this.content = content;
    }

    // ── Getters & Setters ──
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
