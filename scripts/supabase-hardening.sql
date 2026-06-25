-- Omni-Agents Supabase Database Hardening Script
-- Implements encryption, RLS policies, and security best practices

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. CREATE SECURITY POLICIES
-- ============================================

-- Users can only view their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Credentials - only admins can view
CREATE POLICY "Only admins view credentials"
ON credentials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins insert credentials"
ON credentials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins update credentials"
ON credentials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Audit logs - immutable
CREATE POLICY "Audit logs are append-only"
ON audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Audit logs are read-only for admins"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Secrets - only admins
CREATE POLICY "Only admins view secrets"
ON secrets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Projects - users can view their own
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = projects.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Agents - users can view their own
CREATE POLICY "Users can view own agents"
ON agents FOR SELECT
USING (
  created_by = auth.uid()
  OR is_public = true
);

-- Tasks - users can view their own
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (
  assigned_to = auth.uid()
  OR created_by = auth.uid()
);

-- Knowledge - users can view their own
CREATE POLICY "Users can view own knowledge"
ON knowledge FOR SELECT
USING (
  owner_id = auth.uid()
  OR is_shared = true
);

-- ============================================
-- 3. CREATE ENCRYPTION FUNCTIONS
-- ============================================

-- Encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_secret(secret_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Note: Requires pgcrypto extension
  RETURN encode(
    encrypt(
      secret_text::bytea,
      (current_setting('app.encryption_key'))::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql;

-- Decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_secret(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN decrypt(
    decode(encrypted_text, 'base64'),
    (current_setting('app.encryption_key'))::bytea,
    'aes'
  )::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE AUDIT LOGGING FUNCTIONS
-- ============================================

-- Log all changes
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    changes,
    ip_address,
    user_agent,
    status
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id::TEXT,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    current_setting('app.client_ip', true),
    current_setting('app.user_agent', true),
    'success'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER audit_users_changes
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_credentials_changes
AFTER INSERT OR UPDATE OR DELETE ON credentials
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_secrets_changes
AFTER INSERT OR UPDATE OR DELETE ON secrets
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_projects_changes
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- ============================================
-- 5. CREATE RATE LIMITING FUNCTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Get request count in current window
  SELECT request_count INTO v_count
  FROM rate_limits
  WHERE user_id = p_user_id
  AND endpoint = p_endpoint
  AND window_start > NOW() - INTERVAL '1 minute';
  
  -- Return false if limit exceeded
  IF COALESCE(v_count, 0) >= p_limit THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO rate_limits (user_id, endpoint, request_count)
  VALUES (p_user_id, p_endpoint, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE BACKUP FUNCTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name TEXT NOT NULL,
  backup_date TIMESTAMP DEFAULT NOW(),
  size_bytes BIGINT,
  status TEXT DEFAULT 'pending',
  encrypted BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 30
);

-- ============================================
-- 7. ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- 8. CREATE MONITORING VIEWS
-- ============================================

-- Active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT
  usename,
  application_name,
  client_addr,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start DESC;

-- Slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;

-- Table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 9. CREATE SECURITY ALERTS
-- ============================================

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false
);

-- Alert on failed login attempts
CREATE OR REPLACE FUNCTION alert_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' THEN
    INSERT INTO security_alerts (alert_type, severity, message, details)
    VALUES (
      'failed_login',
      'warning',
      'Failed login attempt',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'ip_address', NEW.ip_address,
        'timestamp', NEW.timestamp
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Create app role
CREATE ROLE app_user NOINHERIT;

-- Grant minimal permissions
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Create admin role
CREATE ROLE app_admin NOINHERIT;

-- Grant admin permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- ============================================
-- 11. SECURITY SETTINGS
-- ============================================

-- Require SSL
ALTER SYSTEM SET ssl = on;

-- Set password requirements
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;

-- ============================================
-- 12. FINAL VERIFICATION
-- ============================================

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE rowsecurity = true
ORDER BY tablename;

-- Verify policies are created
SELECT schemaname, tablename, policyname
FROM pg_policies
ORDER BY tablename, policyname;

-- Verify extensions are installed
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pgcrypto', 'uuid-ossp', 'pg_stat_statements');

COMMIT;
