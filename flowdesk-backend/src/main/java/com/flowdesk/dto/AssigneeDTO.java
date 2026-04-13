package com.flowdesk.dto;

public class AssigneeDTO {

    private Long id;
    private String name;
    private String avatar;

    // ── Constructors ──
    public AssigneeDTO() {
    }

    public AssigneeDTO(Long id, String name, String avatar) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
    }

    // ── Getters & Setters ──
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
