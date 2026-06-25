# Model Router Skill

## Description

This skill provides intelligent routing and selection of AI models for all LLM interactions within Omni-Agents Studio. It dynamically chooses the most appropriate model based on task complexity, cost-efficiency, performance requirements, and user-defined preferences, leveraging OpenRouter's capabilities.

## Capabilities

- **Dynamic Model Selection:** Automatically selects the optimal LLM from a pool of available models (via OpenRouter) based on real-time criteria.
- **Cost-Optimized Routing:** Prioritizes free or lower-cost models for simpler tasks and escalates to more powerful, paid models only when necessary, minimizing API expenses.
- **Performance-Based Routing:** Routes requests to models that offer the best latency and throughput for specific task types.
- **Fallback Mechanisms:** Implements robust fallback chains to ensure continuous operation even if a primary model or provider becomes unavailable.
- **Preset Application:** Applies user-defined presets (e.g., Fast Mode, Quality Mode, Coding Mode) to influence model selection and routing behavior.
- **Context-Aware Routing:** Considers context length and other task-specific parameters to select models capable of handling the request.

## Usage

This skill operates primarily in the background, intercepting all LLM invocation requests from agents, tasks, and other parts of Omni-Agents Studio. It ensures that every AI interaction is handled by the most suitable model.

Developers and advanced users can configure routing rules and presets through the OpenRouter Admin Dashboard or directly via API calls.

### Configuration

Model routing logic is configured through the `openrouter.config.ts` module, which defines model tiers, presets, and complexity-based routing rules. Environment variables are used to set API keys and global preferences.

### API Endpoints (tRPC Procedures)

- `modelRouter.routeModel`: Determines the best model for a given request based on input parameters.
- `modelRouter.getAvailableModels`: Lists models currently available through the router, filtered by capabilities or cost.
- `modelRouter.getRoutingHistory`: Provides a log of model selections and reasons for routing decisions.

## Integration with Omni-Agents Studio

This skill is deeply integrated with the core LLM invocation helper (`server/_core/llm.ts`) and works in conjunction with the OpenRouter Manager skill. It ensures that all AI-powered features in Omni-Agents Studio (Agents, Tasks, Workflows, etc.) benefit from intelligent and cost-effective model utilization.
