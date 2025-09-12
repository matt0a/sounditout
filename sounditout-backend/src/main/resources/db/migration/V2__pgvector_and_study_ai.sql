-- V2__pgvector_and_study_ai.sql
-- pgvector must be present
CREATE EXTENSION IF NOT EXISTS vector;

-- 1) Tables (NO inline FKs here)
CREATE TABLE IF NOT EXISTS report_embedding (
                                                id         BIGSERIAL PRIMARY KEY,
                                                student_id BIGINT NOT NULL,
                                                report_id  BIGINT NOT NULL,
                                                subject    TEXT,
                                                content    TEXT NOT NULL,
                                                embedding  vector(1536) NOT NULL,
                                                created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embedding_vector
    ON report_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_embedding_student_subject
    ON report_embedding (student_id, subject);

CREATE TABLE IF NOT EXISTS study_plan (
                                          id         BIGSERIAL PRIMARY KEY,
                                          student_id BIGINT NOT NULL,
                                          week_start DATE NOT NULL,
                                          goals      TEXT,
                                          tasks      JSONB NOT NULL,
                                          created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_plan_student_week
    ON study_plan (student_id, week_start);

-- 2) Add FKs only if the referenced tables exist (plural or singular).
DO $$
    BEGIN
        -- FK: report_embedding.student_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('students','student')) THEN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_embedding_student') THEN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='students') THEN
                    EXECUTE 'ALTER TABLE report_embedding
                 ADD CONSTRAINT fk_embedding_student
                 FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE';
                ELSE
                    EXECUTE 'ALTER TABLE report_embedding
                 ADD CONSTRAINT fk_embedding_student
                 FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE';
                END IF;
            END IF;
        ELSE
            RAISE NOTICE 'No table students/student found; FK fk_embedding_student not created.';
        END IF;

        -- FK: report_embedding.report_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('progress_reports','progress_report')) THEN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_embedding_report') THEN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='progress_reports') THEN
                    EXECUTE 'ALTER TABLE report_embedding
                 ADD CONSTRAINT fk_embedding_report
                 FOREIGN KEY (report_id) REFERENCES progress_reports(id) ON DELETE CASCADE';
                ELSE
                    EXECUTE 'ALTER TABLE report_embedding
                 ADD CONSTRAINT fk_embedding_report
                 FOREIGN KEY (report_id) REFERENCES progress_report(id) ON DELETE CASCADE';
                END IF;
            END IF;
        ELSE
            RAISE NOTICE 'No table progress_reports/progress_report found; FK fk_embedding_report not created.';
        END IF;

        -- FK: study_plan.student_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('students','student')) THEN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_study_plan_student') THEN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='students') THEN
                    EXECUTE 'ALTER TABLE study_plan
                 ADD CONSTRAINT fk_study_plan_student
                 FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE';
                ELSE
                    EXECUTE 'ALTER TABLE study_plan
                 ADD CONSTRAINT fk_study_plan_student
                 FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE';
                END IF;
            END IF;
        ELSE
            RAISE NOTICE 'No table students/student found; FK fk_study_plan_student not created.';
        END IF;
    END $$;

