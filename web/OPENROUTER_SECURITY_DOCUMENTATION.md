# OpenRouter Security Documentation for Omni-Agents Studio

## Executive Summary

This document outlines the security architecture and best practices for integrating OpenRouter with Omni-Agents Studio. Our approach prioritizes **API key protection, environment isolation, robust prompt injection prevention, sensitive data detection, and comprehensive audit logging** to ensure secure, compliant, and reliable AI interactions. By leveraging OpenRouter's built-in security features and implementing enterprise-grade controls, Omni-Agents Studio maintains a high standard of data privacy and operational integrity.

## 1. API Key Protection and Vault Architecture

### 1.1 Secure Storage of API Keys

All API keys, including the primary OpenRouter API key and any BYOK (Bring Your Own Key) provider keys (e.g., OpenAI, Anthropic, Google), are stored securely in a **secrets vault**. These keys are never hardcoded directly into the application codebase or committed to version control. Instead, they are injected into the runtime environment as environment variables.

**Implementation Details:**

- **Environment Variables:** API keys are accessed via `process.env.OPENROUTER_API_KEY` (or similar for other providers) within the server-side code. This ensures keys are not exposed in client-side bundles.
- **Platform-Managed Secrets:** Omni-Agents Studio leverages the underlying platform's secure secrets management system, which encrypts and manages environment variables, preventing direct access by unauthorized personnel.
- **Server-Side Access Only:** API calls to OpenRouter are exclusively made from the backend (`server/_core/llm.ts` and related tRPC procedures). This prevents client-side exposure of API keys.

### 1.2 Vault Architecture Principles

Our vault architecture adheres to the following principles:

- **Encryption at Rest and in Transit:** All secrets are encrypted when stored and during transmission.
- **Least Privilege Access:** Only necessary services and components have access to specific secrets.
- **Auditability:** Access to the secrets vault is logged and auditable.
- **Rotation:** API keys are periodically rotated to minimize the impact of potential compromises.

## 2. Environment Isolation

Omni-Agents Studio is designed to operate with a strong emphasis on environment isolation to prevent cross-contamination of data and unauthorized access between different projects, agents, and user contexts.

**Key Measures:**

- **Project-Specific Resources:** Each project within Omni-Agents Studio maintains its own set of associated resources (agents, tasks, knowledge bases, connectors). While some resources can be shared (e.g., global skills), their usage is governed by explicit permissions.
- **User Context Separation:** All API requests are authenticated and authorized based on the `ctx.user` object, ensuring that users can only access resources they own or have explicit permissions for.
- **Sandbox Environment:** Development and testing occur within isolated sandbox environments, preventing any impact on production systems.

## 3. Model Routing Security

Model routing is not only optimized for cost and performance but also for security. The Model Router skill (and underlying `openrouter.config.ts`) ensures that requests are routed to models and providers that comply with our security policies.

**Security Aspects of Routing:**

- **Allowed/Blocked Models & Providers:** OpenRouter Guardrails are configured to explicitly allow only trusted models and providers (e.g., OpenAI, Anthropic, Google, DeepSeek, Groq, Mistral, Meta) and block any unknown or untrusted entities.
- **Fallback Chains:** Robust fallback mechanisms prevent workflow failures and ensure that if a primary, secure model becomes unavailable, the system gracefully switches to another approved model, maintaining service continuity without compromising security.
- **BYOK Integration:** When using Bring Your Own Key (BYOK) for providers, the keys are managed securely within the secrets vault, and OpenRouter acts as a secure proxy, abstracting the direct interaction with the provider's API.

## 4. Rate Limiting and Cost Controls

While primarily a cost-management feature, rate limiting and budget controls also serve as a critical security mechanism to prevent abuse, denial-of-service attacks, and unexpected expenditure.

**Controls Implemented:**

- **Daily and Monthly Spending Limits:** Hard limits are set on OpenRouter usage, blocking requests if exceeded. This prevents runaway costs due to misconfigurations or malicious activity.
- **Low Balance Alerts:** Notifications are triggered when credit balances fall below a defined threshold, allowing for proactive intervention.
- **Per-Model Limits:** Specific spending limits can be applied to higher-cost models (Tier 2 and Tier 3) to restrict their usage to critical tasks.
- **Abuse Prevention:** By setting hard limits, the system automatically prevents excessive API calls that could indicate an attack or a bug.

## 5. Abuse Prevention and Guardrails

OpenRouter's Guardrails feature is extensively configured to provide a proactive layer of defense against various forms of abuse, including prompt injection and sensitive data leakage.

**Guardrail: "Omni-Agents Studio" Configuration:**

- **Prompt Injection Protection:**
    - **Enable:** ON
    - **Messages to Scan:** All Messages (User, Assistant, System)
    - **Detection Method:** Combines Regex and Machine Learning to identify malicious patterns.
    - **Actions:**
        - **User Messages:** `REDACT` (removes malicious parts)
        - **Assistant Messages:** `WARN` (logs and alerts, but allows response)
        - **System Messages:** `BLOCK` (prevents execution)
    - **Blocked Patterns:** Specific keywords and phrases commonly associated with injection attempts (e.g., "ignore previous instructions", "system prompt", "jailbreak", "override", "execute code", "access database") are explicitly blocked.

- **Sensitive Information Detection (SID):**
    - **Enable:** ON
    - **Detected Categories:** API Keys, Passwords, Tokens, Secrets, Credit Cards, Email Addresses, Phone Numbers.
    - **Actions:**
        - **API Keys & Credit Cards:** `BLOCK + ALERT` (prevents transmission and notifies administrators).
        - **Passwords:** `REDACT + WARN` (removes sensitive data and logs a warning).
        - **Other (Tokens, Secrets, Emails, Phones):** `REDACT` (removes sensitive data).

## 6. Audit Logs and Team Permissions

Comprehensive audit logging and granular team permissions are essential for accountability, compliance, and incident response.

**Audit Logging:**

- **Centralized Logging:** All security-relevant events, including API key usage, policy violations, model routing decisions, and sensitive data detections, are logged centrally.
- **Detailed Records:** Logs include timestamps, user IDs, agent IDs, action types, and relevant metadata to reconstruct events.
- **Access:** Audit logs are accessible to administrators through the Workspace Manager skill and can be integrated with external SIEM (Security Information and Event Management) systems.

**Team Permissions (Role-Based Access Control - RBAC):**

- **Workspace Roles:** Omni-Agents Studio implements `admin`, `editor`, and `viewer` roles at the workspace level, controlling access to configurations and sensitive data.
- **Project Permissions:** Permissions can be further refined at the project level, ensuring that only authorized team members can modify OpenRouter settings or access specific API keys.
- **Agent Permissions:** Agents operate under the permissions of the user who created or invoked them, preventing agents from performing unauthorized actions.

## 7. Enterprise Best Practices

To maintain an enterprise-grade security posture, Omni-Agents Studio adheres to the following best practices:

- **Regular Security Audits:** Periodic internal and external security audits are conducted to identify and address vulnerabilities.
- **Compliance with Regulations:** Adherence to relevant data protection regulations (e.g., GDPR, CCPA) is maintained, especially concerning Zero Data Retention and data processing.
- **Incident Response Plan:** A clear incident response plan is in place to handle security breaches or policy violations effectively.
- **Continuous Monitoring:** Security systems are continuously monitored for anomalies and potential threats.
- **User Education:** Users are educated on secure practices, including the importance of not including sensitive information in prompts.

## References

[1] OpenRouter Documentation: [https://openrouter.ai/docs](https://openrouter.ai/docs)
[2] OpenRouter Guardrails: [https://openrouter.ai/workspace/guardrails](https://openrouter.ai/workspace/guardrails)
[3] OpenRouter Privacy Settings: [https://openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy)
[4] Omni-Agents Studio Master Build Prompt (Internal Document)
