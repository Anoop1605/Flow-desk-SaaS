package com.flowdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new project — Member 2
 */
public class ProjectCreateRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 255, message = "Project name must be at most 255 characters")
    private String name;

    private String description;

    private String colorTag;

    private String status;

    public ProjectCreateRequest() {
    }

    public ProjectCreateRequest(String name, String description, String colorTag, String status) {
        this.name = name;
        this.description = description;
        this.colorTag = colorTag;
        this.status = status;
    }

    // ── Getters & Setters ──
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColorTag() { return colorTag; }
    public void setColorTag(String colorTag) { this.colorTag = colorTag; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
