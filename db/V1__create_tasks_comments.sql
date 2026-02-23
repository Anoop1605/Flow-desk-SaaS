-- ============================================================
-- FlowDesk — SQL Migration Script (Phase 1)
-- Member 3: Tasks & Comments tables
--
-- DEPENDENCY: The 'projects' table (from Member 2) must exist
--             before running this migration. Run their migration first.
--
-- Run manually in PostgreSQL:
--   psql -U postgres -d flowdesk -f V1__create_tasks_comments.sql
-- ============================================================

-- ── Tasks Table ──
CREATE TABLE IF NOT EXISTS tasks (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'TODO',
    priority        VARCHAR(10)     NOT NULL DEFAULT 'MEDIUM',
    project_id      BIGINT          NOT NULL,
    assignee_id     BIGINT,
    due_date        DATE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FK to Member 2's projects table
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,

    -- CHECK constraints for enum values
    CONSTRAINT chk_tasks_status
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_tasks_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_project_id   ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id  ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status        ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date      ON tasks(due_date);


-- ── Comments Table ──
CREATE TABLE IF NOT EXISTS comments (
    id              BIGSERIAL       PRIMARY KEY,
    task_id         BIGINT          NOT NULL,
    author_id       BIGINT          NOT NULL,
    content         TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FK to tasks table
    CONSTRAINT fk_comments_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_task_id    ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id  ON comments(author_id);
