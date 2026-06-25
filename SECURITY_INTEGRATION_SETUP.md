# Omni-Agents Security & Integration Setup

## Phase 1: Credential Mapping & Configuration

### Platform Credentials

#### 1. GitHub (hoopstreet/Omni-Agents)
- **Repository**: https://github.com/hoopstreet/Omni-Agents
- **Token Type**: Fine-grained Personal Access Token
- **Scopes Required**:
  - `repo` - Full repository access
  - `workflow` - GitHub Actions
  - `admin:repo_hook` - Webhooks
  - `read:org` - Organization access
- **Secret Name**: `GITHUB_TOKEN_FINE_GRAINED`
- **Rotation**: Every 90 days
- **Status**: ✅ Configured

#### 2. Supabase (neuscjccbyqyqxatjwya)
- **Project URL**: https://neuscjccbyqyqxatjwya.supabase.co
- **Project ID**: neuscjccbyqyqxatjwya
- **Region**: ap-southeast-2 (Sydney)
- **Credentials**:
  - `SUPABASE_URL` - Project URL
  - `SUPABASE_ANON_KEY` - Public anon key
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role (admin)
- **Rotation**: Every 60 days
- **Status**: ✅ Configured

#### 3. OpenRouter (Omni-Agents Workspace)
- **API Key**: 963ca64c9fee10adb81cfef857ee0850b26844bc3a494358c0f8ebff19495e6b
- **Secret Name**: `OPENROUTER_API_KEY`
- **Webhook Key**: `OPENROUTER_WEBHOOK_KEY`
- **Budget**: $10/day
- **Models Available**: 129 (105 partially, 186 unavailable)
- **Expiration**: July 20, 2026
- **Rotation**: Every 30 days (before expiration)
- **Status**: ✅ Configured

#### 4. Expo (hoopstreet organization)
- **Account**: https://expo.dev/accounts/hoopstreet
- **Project**: Omni-Agents
- **Platforms**: Android, iOS
- **Secret Name**: `EXPO_TOKEN`
- **Rotation**: Every 90 days
- **Status**: ⚠️ Setup incomplete (1/5 complete)

#### 5. Notion (Omni-Agents Workspace)
- **Workspace**: Omni-Agents
- **Page**: Teamspace Home
- **URL**: https://app.notion.com/p/Teamspace-Home-76ed18d886b98233853781d2f4dd9050
- **Secret Name**: `NOTION_API_KEY`
- **Rotation**: Every 90 days
- **Status**: ⚠️ API integration pending

#### 6. Google Cloud
- **Secret Name**: `GOOGLE_API_KEY`
- **Services**: Drive, Calendar, Gmail, Sheets
- **Rotation**: Every 90 days
- **Status**: ✅ Configured

---

## Phase 2: Secrets Management

### GitHub Secrets Configuration

```yaml
Secrets to Configure in GitHub:
1. GITHUB_TOKEN_FINE_GRAINED
2. SUPABASE_URL
3. SUPABASE_ANON_KEY
4. SUPABASE_SERVICE_ROLE_KEY
5. OPENROUTER_API_KEY
6. OPENROUTER_WEBHOOK_KEY
7. EXPO_TOKEN
8. NOTION_API_KEY
9. GOOGLE_API_KEY
10. SLACK_WEBHOOK (for notifications)
```

### Supabase Secrets Table

```sql
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  rotation_interval_days INTEGER,
  last_rotated TIMESTAMP,
  status TEXT DEFAULT 'active',
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS secret_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID REFERENCES secrets(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID,
  ip_address TEXT,
  details JSONB
);
```

### Encryption Strategy

- **Algorithm**: AES-256-GCM
- **Key Storage**: Supabase Vault (encrypted at rest)
- **Key Rotation**: Every 180 days
- **Backup**: Encrypted backups in S3

---

## Phase 3: Security Scanning (24/7)

### Automated Scanning Tools

#### 1. GitHub Advanced Security
- **SAST** (Static Application Security Testing)
  - CodeQL analysis
  - Dependency scanning
  - Secret scanning
- **Schedule**: On every push + daily
- **Alerts**: Slack notifications

#### 2. Snyk Integration
- **Vulnerability Scanning**: npm packages
- **License Compliance**: Check license compatibility
- **Container Scanning**: Docker images
- **Schedule**: Continuous

#### 3. OWASP Dependency Check
- **CVE Detection**: Known vulnerabilities
- **Report Generation**: HTML + JSON
- **Schedule**: Daily

#### 4. SonarQube
- **Code Quality**: Technical debt
- **Security Hotspots**: Potential vulnerabilities
- **Coverage**: Unit test coverage
- **Schedule**: On every push

#### 5. Trivy
- **Container Scanning**: Docker images
- **Filesystem Scanning**: OS packages
- **Repository Scanning**: Git history
- **Schedule**: Daily

---

## Phase 4: Repository Cleanup & Sanitization

### Pre-deployment Checks

```bash
# 1. Scan for secrets
git log --all --source --remotes -S 'password\|token\|key' --pretty=format:"%h %s"

# 2. Check for large files
git rev-list --all --objects | sort -k2 | tail -10

# 3. Scan for malware
clamscan -r --heuristic-scan-option=Plus .

# 4. Check dependencies
npm audit
pnpm audit

# 5. Security headers
npm run security-check
```

### Cleanup Actions

1. **Remove Secrets**
   - Scan git history for exposed credentials
   - Use BFG Repo-Cleaner to remove from history
   - Rotate all exposed credentials

2. **Remove Large Files**
   - Identify files > 100MB
   - Move to Git LFS or S3
   - Update .gitignore

3. **Malware Scan**
   - ClamAV full scan
   - VirusTotal API check
   - Remove suspicious files

4. **Dependency Audit**
   - npm audit fix
   - Update vulnerable packages
   - Review security advisories

---

## Phase 5: Database Security (Supabase)

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Only admins can view credentials
CREATE POLICY "Only admins view credentials"
ON credentials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Audit logs are immutable
CREATE POLICY "Audit logs are append-only"
ON audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Audit logs are read-only"
ON audit_logs FOR UPDATE
USING (false);
```

### Encryption at Rest

- **Database**: PostgreSQL native encryption
- **Backups**: Encrypted with KMS
- **Secrets**: Vault encryption
- **Files**: S3 server-side encryption

### Backup Strategy

- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Encryption**: AES-256
- **Location**: Geographically distributed

---

## Phase 6: Endpoint Security & API Protection

### Rate Limiting

```typescript
// API rate limiting
const rateLimit = {
  public: "10 requests per minute",
  authenticated: "100 requests per minute",
  admin: "1000 requests per minute"
};
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: [
    "https://omni-agents.app",
    "https://omniagents-zycdtw8o.manus.space",
    "https://expo.dev"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
```

### API Key Validation

```typescript
// Validate API keys on every request
const validateApiKey = async (key: string) => {
  const credential = await db.credentials.findOne({ apiKey: key });
  if (!credential || credential.status === 'revoked') {
    throw new Error('Invalid API key');
  }
  return credential;
};
```

### Webhook Security

```typescript
// Verify webhook signatures
const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
) => {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
};
```

---

## Phase 7: Compliance & Audit Trail

### Audit Logging

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  status TEXT -- 'success', 'failure'
);
```

### Logged Events

- ✅ Credential creation/rotation/revocation
- ✅ User login/logout
- ✅ API key generation/deletion
- ✅ Database schema changes
- ✅ Permission changes
- ✅ Security policy updates
- ✅ Failed authentication attempts
- ✅ Suspicious activities

### Compliance Reports

```bash
# Generate monthly compliance report
npm run compliance:report

# Export audit logs
npm run audit:export

# Security assessment
npm run security:assessment
```

---

## Phase 8: Deployment Checklist

### Pre-deployment

- [ ] All secrets configured in GitHub Secrets
- [ ] Supabase RLS policies enabled
- [ ] Security scanning passed
- [ ] No exposed credentials in git history
- [ ] All dependencies updated
- [ ] Tests passing
- [ ] Code review completed
- [ ] Security audit passed

### Deployment

- [ ] Deploy to production
- [ ] Verify all endpoints
- [ ] Monitor error logs
- [ ] Verify credential rotation
- [ ] Test failover scenarios

### Post-deployment

- [ ] Monitor security alerts
- [ ] Review audit logs
- [ ] Verify backups
- [ ] Test disaster recovery
- [ ] Update documentation

---

## Credential Rotation Schedule

| Provider | Interval | Next Rotation | Status |
|----------|----------|---------------|--------|
| GitHub | 90 days | Sep 2026 | ✅ |
| Supabase | 60 days | Aug 2026 | ✅ |
| OpenRouter | 30 days | Jul 2026 | ⚠️ Expiring |
| Expo | 90 days | Sep 2026 | ⚠️ |
| Notion | 90 days | Sep 2026 | ⚠️ |
| Google | 90 days | Sep 2026 | ✅ |

---

## Emergency Procedures

### Credential Compromise

1. **Immediate Actions**
   - Revoke compromised credential
   - Generate new credential
   - Update all references
   - Notify team via Slack

2. **Investigation**
   - Review audit logs
   - Check for unauthorized access
   - Identify affected resources
   - Document incident

3. **Recovery**
   - Rotate all related credentials
   - Update backups
   - Verify system integrity
   - Resume normal operations

### Security Incident Response

1. **Detection** → Alert team
2. **Containment** → Isolate affected systems
3. **Investigation** → Determine scope
4. **Remediation** → Fix vulnerabilities
5. **Recovery** → Restore systems
6. **Post-incident** → Review and improve

---

## 24/7 Monitoring

### Alerts

- ✅ Failed authentication attempts
- ✅ Credential expiration warnings
- ✅ Suspicious API activity
- ✅ Security scanning failures
- ✅ Backup failures
- ✅ Database anomalies
- ✅ Rate limit exceeded
- ✅ Unauthorized access attempts

### Notification Channels

- **Slack**: Real-time alerts
- **Email**: Daily summary
- **PagerDuty**: Critical incidents
- **GitHub**: Security advisories

---

## References

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
