## AI Agent: OpenRouter Configuration for Omni-Agents Studio

**Objective:** Configure OpenRouter for Omni-Agents Studio projects to achieve maximum cost-efficiency, security, reliability, and execution quality, strictly adhering to the provided `OPENROUTER_CONFIG_GUIDE.md`.

**Instructions:**

1.  **Review `OPENROUTER_CONFIG_GUIDE.md`:** Thoroughly read and understand the detailed configuration guide located at `/home/ubuntu/omni-agents-studio/OPENROUTER_CONFIG_GUIDE.md`.

2.  **Implement Tier-Based Model Routing:**
    *   **Default to Free Models:** For basic tasks (chat, classification, summaries, tagging, simple reasoning, lightweight agent tasks), prioritize and use the highest-quality free OpenRouter models as specified in Tier 1 of the guide.
    *   **Smart Escalation:** Automatically escalate to mid-tier paid models (Tier 2) for coding, agent orchestration, RAG, tool use, and medium-complexity tasks. Only use premium models (Tier 3) for critical tasks like architecture design, large-context analysis, and strategic planning.

3.  **Configure Routing Settings:**
    *   Enable **Auto Router**.
    *   Set **Cost/Quality Balance** to `5` (Balanced).
    *   Define **Allowed Models** and **Default Provider Sort** as per the guide.
    *   Establish **Model Fallback Chains** to prevent workflow failures.

4.  **Apply Security Measures:**
    *   Enable **Zero Data Retention (ZDR)** for all applicable providers.
    *   Disable **training on requests** for both paid and free endpoints.
    *   Implement **Prompt Injection Protection** and **Sensitive Data Detection** via Guardrails, with specified actions (REDACT, WARN, BLOCK, ALERT).

5.  **Set Budget Controls:**
    *   Configure **Daily and Monthly Spending Limits**.
    *   Set up **Low Credit Alerts**.
    *   Track model usage and costs per agent (if API supports).

6.  **Define Presets:** Ensure the following presets are configured as per the guide:
    *   `Fast Mode` (cheapest acceptable models)
    *   `Balanced Mode` (best value)
    *   `Quality Mode` (highest accuracy)
    *   `Coding Mode` (code-optimized models)
    *   `Research Mode` (large-context reasoning models)

7.  **Verify Configuration:** After implementation, ensure all settings align with the `OPENROUTER_CONFIG_GUIDE.md` to guarantee optimal performance, cost management, and security for Omni-Agents Studio projects.
