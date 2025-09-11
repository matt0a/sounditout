-- Attach FKs after core tables exist (safe to run anytime)

DO $$
BEGIN
  -- report_embedding.student_id -> students.id / student.id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='students')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_student') THEN
    EXECUTE 'ALTER TABLE report_embedding
             ADD CONSTRAINT fk_embedding_student
             FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_student') THEN
    EXECUTE 'ALTER TABLE report_embedding
             ADD CONSTRAINT fk_embedding_student
             FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE';
END IF;

  -- report_embedding.report_id -> progress_reports.id / progress_report.id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='progress_reports')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_report') THEN
    EXECUTE 'ALTER TABLE report_embedding
             ADD CONSTRAINT fk_embedding_report
             FOREIGN KEY (report_id) REFERENCES progress_reports(id) ON DELETE CASCADE';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='progress_report')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_embedding_report') THEN
    EXECUTE 'ALTER TABLE report_embedding
             ADD CONSTRAINT fk_embedding_report
             FOREIGN KEY (report_id) REFERENCES progress_report(id) ON DELETE CASCADE';
END IF;

  -- study_plan.student_id -> students.id / student.id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='students')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_study_plan_student') THEN
    EXECUTE 'ALTER TABLE study_plan
             ADD CONSTRAINT fk_study_plan_student
             FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_study_plan_student') THEN
    EXECUTE 'ALTER TABLE study_plan
             ADD CONSTRAINT fk_study_plan_student
             FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE';
END IF;
END $$;
