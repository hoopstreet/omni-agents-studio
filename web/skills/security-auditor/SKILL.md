# Security Auditor Skill

## Description

This skill provides robust security auditing and enforcement capabilities for Omni-Agents Studio, ensuring the integrity, confidentiality, and availability of AI interactions and data. It focuses on API key protection, environment isolation, prompt injection prevention, sensitive data detection, and comprehensive audit logging.

## Capabilities

- **API Key Protection:** Manages and validates the secure storage and usage of API keys for external services, including OpenRouter and other integrations.
- **Environment Isolation:** Ensures that different projects and agents operate within isolated environments to prevent unauthorized access or data leakage.
- **Prompt Injection Prevention:** Implements and monitors mechanisms to detect and mitigate prompt injection attacks, safeguarding AI model behavior.
- **Sensitive Data Detection:** Scans prompts and responses for sensitive information (e.g., PII, credentials) and applies redaction or blocking policies.
- **Audit Logging & Monitoring:** Provides detailed audit logs of all security-relevant events, including access attempts, policy violations, and model interactions.
- **Compliance Checks:** Performs automated checks against defined security policies and best practices.
- **Role-Based Access Control (RBAC) Validation:** Verifies that user and agent actions adhere to their assigned roles and permissions.

## Usage

This skill operates primarily in the background, continuously monitoring the Omni-Agents Studio environment. Administrators and security personnel can interact with it through a dedicated security dashboard or via API calls to:

- Review security audit logs and incident reports.
- Configure and enforce security policies.
- Receive alerts on potential security threats or policy violations.
- Validate the security posture of agents, skills, and integrations.

### Configuration

Security policies and settings are primarily defined in the `server/openrouter.config.ts` module (for OpenRouter-specific security) and system-wide security configurations. Audit logs are stored in the `auditLogs` table.

### API Endpoints (tRPC Procedures)

- `security.getAuditLogs`: Retrieves security audit logs with filtering and search capabilities.
- `security.getPolicyStatus`: Reports on the current status and enforcement of security policies.
- `security.scanPrompt`: Scans a given prompt for potential injection attempts or sensitive data.
- `security.validateApiKey`: Validates the integrity and permissions of an API key.
- `security.getSecurityReport`: Generates a comprehensive security report for the Omni-Agents Studio instance.

## Integration with Omni-Agents Studio

This skill is deeply integrated with the OpenRouter Manager, Agent System, and Workspace Manager. It intercepts LLM calls to apply prompt injection and sensitive data detection, monitors user and agent actions for policy violations, and contributes to the overall security posture of the platform. It ensures that Omni-Agents Studio operates in a secure and compliant manner.
