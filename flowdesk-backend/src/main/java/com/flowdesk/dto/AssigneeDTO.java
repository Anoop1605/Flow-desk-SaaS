package com.flowdesk.dto;

public class AssigneeDTO {

    private Long id;
    private String name;

    // ── Constructors ──
    public AssigneeDTO() {
    }

    public AssigneeDTO(Long id, String name) {
        this.id = id;
        this.name = name;
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
}
