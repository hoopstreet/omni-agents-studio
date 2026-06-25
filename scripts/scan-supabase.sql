-- Omni-Agents Supabase Database Security & Integrity Scan
-- Comprehensive database security audit and integrity checks

-- ============================================
-- 1. DATABASE SECURITY AUDIT
-- ============================================

-- Check for Row Level Security (RLS) status
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS_Enabled"
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Check for tables without RLS
SELECT 
    schemaname,
    tablename,
    'WARNING: RLS not enabled' as security_issue
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
AND rowsecurity = false;

-- ============================================
-- 2. ENCRYPTION & SENSITIVE DATA AUDIT
-- ============================================

-- Check for sensitive columns without encryption
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN column_name LIKE '%password%' THEN 'PASSWORD - CHECK ENCRYPTION'
        WHEN column_name LIKE '%secret%' THEN 'SECRET - CHECK ENCRYPTION'
        WHEN column_name LIKE '%token%' THEN 'TOKEN - CHECK ENCRYPTION'
        WHEN column_name LIKE '%key%' THEN 'KEY - CHECK ENCRYPTION'
        WHEN column_name LIKE '%credit_card%' THEN 'PCI - CHECK ENCRYPTION'
        WHEN column_name LIKE '%ssn%' THEN 'PII - CHECK ENCRYPTION'
        WHEN column_name LIKE '%email%' THEN 'PII - CHECK ENCRYPTION'
        ELSE NULL
    END as sensitivity
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND (
    column_name LIKE '%password%'
    OR column_name LIKE '%secret%'
    OR column_name LIKE '%token%'
    OR column_name LIKE '%key%'
    OR column_name LIKE '%credit_card%'
    OR column_name LIKE '%ssn%'
    OR column_name LIKE '%email%'
)
ORDER BY table_schema, table_name, column_name;

-- ============================================
-- 3. ACCESS CONTROL AUDIT
-- ============================================

-- Check role permissions
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY grantee, table_schema, table_name;

-- Check for overly permissive grants
SELECT 
    grantee,
    table_schema,
    table_name,
    'WARNING: Overly permissive' as permission_issue
FROM information_schema.role_table_grants
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND privilege_type = 'ALL PRIVILEGES'
AND grantee NOT IN ('postgres', 'pg_database_owner');

-- ============================================
-- 4. AUDIT LOGGING CONFIGURATION
-- ============================================

-- Check for audit logging
SELECT 
    schemaname,
    tablename,
    'Check for audit triggers' as audit_status
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Check for existing audit tables
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename LIKE '%audit%'
OR tablename LIKE '%log%'
ORDER BY schemaname, tablename;

-- ============================================
-- 5. DATA INTEGRITY CHECKS
-- ============================================

-- Check for NULL constraints
SELECT 
    table_schema,
    table_name,
    column_name,
    is_nullable,
    CASE 
        WHEN is_nullable = 'YES' THEN 'WARNING: Nullable column'
        ELSE 'OK'
    END as integrity_status
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND column_name IN ('id', 'user_id', 'created_at', 'updated_at')
ORDER BY table_schema, table_name, column_name;

-- Check for foreign key constraints
SELECT 
    constraint_name,
    table_schema,
    table_name,
    column_name
FROM information_schema.constraint_column_usage
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Check for missing primary keys
SELECT 
    schemaname,
    tablename,
    'WARNING: No primary key' as data_integrity_issue
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = schemaname
    AND table_name = tablename
    AND constraint_type = 'PRIMARY KEY'
);

-- ============================================
-- 6. INDEX PERFORMANCE AUDIT
-- ============================================

-- Check for missing indexes on foreign keys
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    'WARNING: Foreign key without index' as performance_issue
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage c ON tc.constraint_name = c.constraint_name
JOIN information_schema.tables t ON tc.table_schema = t.table_schema AND tc.table_name = t.table_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = t.table_schema
    AND tablename = t.table_name
    AND indexdef LIKE '%' || c.column_name || '%'
);

-- Check index sizes
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- 7. BACKUP & REPLICATION STATUS
-- ============================================

-- Check replication status
SELECT 
    client_addr,
    state,
    write_lag,
    flush_lag,
    replay_lag
FROM pg_stat_replication;

-- Check WAL archiving
SELECT 
    name,
    setting
FROM pg_settings
WHERE name LIKE '%archive%'
OR name LIKE '%wal%';

-- ============================================
-- 8. CONNECTION & RESOURCE LIMITS
-- ============================================

-- Check connection limits
SELECT 
    datname,
    datacl,
    'Check connection limits' as status
FROM pg_database
WHERE datname NOT IN ('postgres', 'template0', 'template1');

-- Check for long-running queries
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    state_change,
    query
FROM pg_stat_activity
WHERE state != 'idle'
AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start DESC;

-- ============================================
-- 9. EXTENSION & PLUGIN AUDIT
-- ============================================

-- List installed extensions
SELECT 
    extname,
    extversion,
    extschema
FROM pg_extension
ORDER BY extname;

-- Check for pgaudit (recommended for compliance)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgaudit') 
        THEN 'pgaudit is installed'
        ELSE 'WARNING: pgaudit not installed (recommended for audit logging)'
    END as audit_extension_status;

-- ============================================
-- 10. COMPLIANCE & SECURITY SUMMARY
-- ============================================

-- Generate security summary
SELECT 
    'Database Security Audit Summary' as audit_type,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')) as total_tables,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') AND rowsecurity = true) as rls_enabled_tables,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') AND rowsecurity = false) as rls_disabled_tables,
    (SELECT COUNT(*) FROM pg_extension) as extensions_installed,
    (SELECT COUNT(*) FROM pg_stat_replication) as replication_slots;

-- ============================================
-- 11. RECOMMENDATIONS
-- ============================================

-- Generate recommendations
SELECT 
    'CRITICAL' as severity,
    'Enable RLS on all tables' as recommendation,
    'Row Level Security prevents unauthorized data access' as reason
UNION ALL
SELECT 
    'HIGH',
    'Encrypt sensitive columns',
    'Passwords, tokens, and keys should be encrypted'
UNION ALL
SELECT 
    'HIGH',
    'Install pgaudit extension',
    'Required for compliance (GDPR, HIPAA, SOC2)'
UNION ALL
SELECT 
    'MEDIUM',
    'Add indexes to foreign keys',
    'Improves query performance and data integrity'
UNION ALL
SELECT 
    'MEDIUM',
    'Set up automated backups',
    'Ensure data recovery capability'
UNION ALL
SELECT 
    'LOW',
    'Review role permissions',
    'Ensure least privilege principle is followed';

-- ============================================
-- 12. DATA RETENTION AUDIT
-- ============================================

-- Check for data retention policies
SELECT 
    table_schema,
    table_name,
    CASE 
        WHEN column_name = 'created_at' THEN 'Has creation timestamp'
        WHEN column_name = 'updated_at' THEN 'Has update timestamp'
        WHEN column_name = 'deleted_at' THEN 'Supports soft deletes'
        ELSE NULL
    END as retention_feature
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND column_name IN ('created_at', 'updated_at', 'deleted_at')
ORDER BY table_schema, table_name;

-- ============================================
-- 13. GENERATE AUDIT REPORT
-- ============================================

-- Create audit report table if not exists
CREATE TABLE IF NOT EXISTS database_audit_reports (
    id SERIAL PRIMARY KEY,
    audit_date TIMESTAMP DEFAULT NOW(),
    audit_type VARCHAR(100),
    findings TEXT,
    severity VARCHAR(20),
    recommendation TEXT,
    status VARCHAR(50) DEFAULT 'PENDING'
);

-- Insert audit findings
INSERT INTO database_audit_reports (audit_type, findings, severity, recommendation)
SELECT 
    'RLS Configuration',
    'Tables without RLS enabled: ' || COUNT(*)::TEXT,
    'CRITICAL',
    'Enable RLS on all tables'
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
AND rowsecurity = false;

-- ============================================
-- END OF AUDIT SCRIPT
-- ============================================

-- Summary
SELECT 
    'Supabase Database Security Audit Complete' as status,
    NOW() as audit_timestamp,
    'Review findings and implement recommendations' as next_step;
