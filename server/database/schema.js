/**
 * Database schema. All statements are idempotent (IF NOT EXISTS) so the
 * schema can safely run on every startup.
 *
 * Content is fully data-driven: modules -> sections -> lessons, and
 * sections own quizzes -> questions. Nothing here is specific to Java.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  university TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#4f46e5',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  theme TEXT NOT NULL DEFAULT 'system',
  email_notifications INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'book',
  color TEXT NOT NULL DEFAULT '#4f46e5',
  category TEXT NOT NULL DEFAULT 'Programming',
  level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
  estimated_hours INTEGER NOT NULL DEFAULT 10,
  is_published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  content_json TEXT NOT NULL DEFAULT '[]',
  starter_code TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (section_id, slug)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pass_percent INTEGER NOT NULL DEFAULT 70,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  time_limit_minutes INTEGER,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice','true_false','code_output')),
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  prompt TEXT NOT NULL,
  code TEXT,
  options_json TEXT NOT NULL DEFAULT '[]',
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lesson_completions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS saved_lessons (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percent INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  answers_json TEXT NOT NULL DEFAULT '[]',
  duration_seconds INTEGER,
  completed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS study_days (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  minutes INTEGER NOT NULL DEFAULT 0,
  activities INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general',
  rule_type TEXT NOT NULL,
  rule_value INTEGER NOT NULL DEFAULT 1,
  rule_ref TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TEXT NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS code_snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'java',
  code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sections_module ON sections(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_completions_user ON lesson_completions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_snippets_user ON code_snippets(user_id, updated_at);
`;
