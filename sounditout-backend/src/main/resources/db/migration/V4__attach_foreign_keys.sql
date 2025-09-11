-- Attach FKs from AI tables to your domain tables, only if targets exist.
DO $$
DECLARE
_student_table text := null;
  _report_table  text := null;
BEGIN
  -- Detect student table name (try common options)
SELECT 'students' INTO _student_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='students');
IF _student_table IS NULL THEN
SELECT 'student' INTO _student_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student');
END IF;
  IF _student_table IS NULL THEN
SELECT 'users' INTO _student_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users');
END IF;

  -- Detect report table name (try common options)
SELECT 'progress_reports' INTO _report_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='progress_reports');
IF _report_table IS NULL THEN
SELECT 'progress_report' INTO _report_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='progress_report');
END IF;
  IF _report_table IS NULL THEN
SELECT 'reports' INTO _report_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reports');
END IF;
  IF _report_table IS NULL THEN
SELECT 'report' INTO _report_table
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='report');
END IF;

  -- FK: report_embedding.student_id -> <student_table>.id
  IF _student_table IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_student') THEN
    EXECUTE format('ALTER TABLE report_embedding
                    ADD CONSTRAINT fk_embedding_student
                    FOREIGN KEY (student_id) REFERENCES %I(id) ON DELETE CASCADE', _student_table);
ELSE
    RAISE NOTICE 'Student table not found; fk_embedding_student not created.';
END IF;

  -- FK: report_embedding.report_id -> <report_table>.id
  IF _report_table IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_report') THEN
    EXECUTE format('ALTER TABLE report_embedding
                    ADD CONSTRAINT fk_embedding_report
                    FOREIGN KEY (report_id) REFERENCES %I(id) ON DELETE CASCADE', _report_table);
ELSE
    RAISE NOTICE 'Report table not found; fk_embedding_report not created.';
END IF;

  -- FK: study_plan.student_id -> <student_table>.id
  IF _student_table IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_study_plan_student') THEN
    EXECUTE format('ALTER TABLE study_plan
                    ADD CONSTRAINT fk_study_plan_student
                    FOREIGN KEY (student_id) REFERENCES %I(id) ON DELETE CASCADE', _student_table);
ELSE
    RAISE NOTICE 'Student table not found; fk_study_plan_student not created.';
END IF;
END $$;
