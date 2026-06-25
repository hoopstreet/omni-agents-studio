# OpenRouter Manager Skill

## Description

This skill provides comprehensive management and optimization for OpenRouter within Omni-Agents Studio. It enables dynamic model routing, cost control, security hardening, and performance monitoring for all AI agent interactions.

## Capabilities

- **Dynamic Model Routing:** Automatically selects the most cost-effective and performant LLM based on task complexity and user-defined presets.
- **Cost Optimization:** Implements tiered model selection (free, mid-tier, premium) and budget controls to minimize AI API expenses.
- **Security Hardening:** Configures Zero Data Retention (ZDR), prompt injection protection, and sensitive data detection to ensure secure AI interactions.
- **Performance Monitoring:** Tracks model usage, costs, and API health to identify optimization opportunities.
- **Preset Management:** Allows users to define and switch between different OpenRouter configurations (e.g., Fast Mode, Quality Mode, Coding Mode).

## Usage

This skill is primarily integrated into the backend of Omni-Agents Studio to manage all LLM calls. Frontend components will interact with this skill via tRPC procedures to:

- Select appropriate models for tasks.
- Apply security policies.
- Monitor costs and usage.
- Configure OpenRouter settings through a dedicated admin dashboard.

### Configuration

OpenRouter settings are managed through environment variables and a dedicated configuration module (`server/openrouter.config.ts`).

**Environment Variables (to be set in your `.env` file or platform secrets):**

- `OPENROUTER_API_KEY`: Your OpenRouter API key.
- `OPENROUTER_BASE_URL`: (Default: `https://openrouter.ai/api/v1`)
- `OPENROUTER_COST_QUALITY_BALANCE`: (Default: `5` - Balanced)
- `OPENROUTER_DEFAULT_MODEL`: (Default: `google/gemini-2.5-flash`)
- `OPENROUTER_FALLBACK_MODEL`: (Default: `meta/llama-3.1-8b`)
- `OPENROUTER_DAILY_BUDGET`: (Default: `50`)
- `OPENROUTER_MONTHLY_BUDGET`: (Default: `1000`)
- `OPENROUTER_ENABLE_GUARDRAILS`: (Default: `true`)
- `OPENROUTER_ENABLE_ZDR`: (Default: `true`)
- `OPENROUTER_ENABLE_INJECTION_PROTECTION`: (Default: `true`)

### API Endpoints (tRPC Procedures)

- `openrouter.getModels`: Retrieves a list of available OpenRouter models with their capabilities and pricing.
- `openrouter.selectModel`: Selects an optimal model based on task complexity and context length.
- `openrouter.getCostEstimate`: Provides a cost estimate for a given model and token usage.
- `openrouter.getUsageStats`: Retrieves usage statistics and cost data for the current period.
- `openrouter.updateSettings`: Updates OpenRouter configuration settings (e.g., cost/quality balance, default model).

## Integration with Omni-Agents Studio

This skill is integrated into the core LLM invocation logic (`server/_core/llm.ts`) to dynamically select models and apply security policies before making API calls to OpenRouter. It also powers the OpenRouter Admin Dashboard for visual management and monitoring.
