-- ============================================================
-- FlowDesk — SQL Migration Script (Phase 1)
-- Member 2: Projects & Team Members tables
--
-- This migration MUST run BEFORE V1__create_tasks_comments.sql
-- because the tasks table has a FK reference to projects(id).
--
-- Run manually in PostgreSQL:
--   psql -U postgres -d flowdesk -f V0__create_projects_team_members.sql
-- ============================================================

-- ── Projects Table ──
CREATE TABLE IF NOT EXISTS projects (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    color_tag       VARCHAR(20),
    owner_id        BIGINT,
    tenant_id       BIGINT          NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- CHECK constraints for enum values
    CONSTRAINT chk_projects_status
        CHECK (status IN ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id  ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id   ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);


-- ── Team Members Table ──
CREATE TABLE IF NOT EXISTS team_members (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    project_id      BIGINT          NOT NULL,
    role_in_project VARCHAR(20)     NOT NULL DEFAULT 'MEMBER',
    joined_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FK to projects table
    CONSTRAINT fk_team_members_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,

    -- CHECK constraints for enum values
    CONSTRAINT chk_team_members_role
        CHECK (role_in_project IN ('MANAGER', 'MEMBER')),

    -- Prevent duplicate user-project assignments
    CONSTRAINT uq_team_members_user_project
        UNIQUE (user_id, project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_project_id  ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id     ON team_members(user_id);
