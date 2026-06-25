# Cost Optimizer Skill

## Description

This skill provides advanced capabilities for monitoring, analyzing, and optimizing the costs associated with AI model usage within Omni-Agents Studio. It leverages OpenRouter's budget controls and intelligent model routing to ensure cost-efficiency without compromising performance or accuracy.

## Capabilities

- **Real-time Cost Tracking:** Monitors and reports AI model usage costs in real-time across projects, agents, and individual tasks.
- **Budget Management:** Allows users to set daily and monthly spending limits for OpenRouter API usage.
- **Alerting System:** Notifies users and administrators when credit balances are low or spending limits are approached/exceeded.
- **Cost Estimation:** Provides pre-call cost estimates for LLM invocations, enabling agents and users to make informed decisions about model selection.
- **Cost-Saving Recommendations:** Analyzes usage patterns and suggests alternative, more cost-effective models or routing strategies.
- **Usage Analytics:** Generates detailed reports on model usage, cost breakdown by model, agent, and project.

## Usage

Users interact with this skill primarily through the OpenRouter Admin Dashboard, where they can:

- View current and historical cost data.
- Set and adjust budget limits.
- Receive alerts regarding their spending.
- Analyze cost trends and identify areas for optimization.

AI agents can also query this skill to estimate the cost of potential LLM calls before execution, allowing them to prioritize cost-efficiency in their decision-making processes.

### Configuration

This skill relies on the budget settings defined in `server/openrouter.config.ts` and integrates with the OpenRouter API to fetch actual usage and cost data. Environment variables for API keys are managed by the OpenRouter Manager skill.

### API Endpoints (tRPC Procedures)

- `cost.getUsageReport`: Retrieves detailed cost and usage reports for a specified period.
- `cost.getBudgetStatus`: Provides the current budget usage, remaining credits, and alert status.
- `cost.estimateCall`: Estimates the cost of a hypothetical LLM call given a model, input tokens, and output tokens.
- `cost.setBudgetLimits`: Sets or updates daily and monthly spending limits.
- `cost.getCostBreakdown`: Returns a breakdown of costs by model, agent, or project.

## Integration with Omni-Agents Studio

This skill is tightly integrated with the OpenRouter Manager and Model Router skills, forming a comprehensive cost management solution. It provides critical data and functionality for the OpenRouter Admin Dashboard and enables cost-aware decision-making throughout the Omni-Agents Studio platform.
