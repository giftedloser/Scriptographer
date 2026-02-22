-- Scripts table: stores PowerShell scripts
CREATE TABLE IF NOT EXISTS scripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  modified_at INTEGER NOT NULL
);

-- Executions table: tracks script execution sessions
CREATE TABLE IF NOT EXISTS executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  targets TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  total_targets INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Execution logs table: per-target execution logs
CREATE TABLE IF NOT EXISTS execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER NOT NULL,
  target TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  exit_code INTEGER,
  success INTEGER DEFAULT 0,
  FOREIGN KEY(execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_executions_script ON executions(script_id);
CREATE INDEX IF NOT EXISTS idx_logs_execution ON execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON execution_logs(timestamp);

-- Target Groups table: stores named lists of targets
CREATE TABLE IF NOT EXISTS target_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  targets TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Categories table: organizes scripts into folders
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
