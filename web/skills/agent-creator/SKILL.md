# Agent Creator Skill

## Description

This skill empowers users to design, configure, and manage AI agents within Omni-Agents Studio. It provides a structured workflow for defining agent personalities, capabilities, tools, and integration points.

## Capabilities

- **Agent Definition:** Define core agent attributes such as name, description, and primary function.
- **System Prompt Management:** Craft and refine system prompts to guide agent behavior and personality.
- **Tool Assignment:** Assign specific tools and connectors to agents, enabling them to interact with external services and data sources.
- **Model Selection:** Configure the default LLM for each agent, leveraging the OpenRouter Manager skill for optimized routing.
- **Versioning:** Maintain different versions of agents, allowing for iterative development and testing.
- **Template Creation:** Save agent configurations as templates for quick reuse and sharing within the marketplace.

## Usage

This skill is primarily accessed through the Agent Builder interface in Omni-Agents Studio. Users can:

- Create new agents from scratch or by using existing templates.
- Edit agent configurations, including system prompts, assigned tools, and model preferences.
- Test agent behavior and performance.
- Publish agents to the marketplace or share them within their workspace.

### Configuration

Agent configurations are stored in the `agents` table in the database. The `systemPrompt` and `tools` fields are critical for defining agent behavior.

### API Endpoints (tRPC Procedures)

- `agents.create`: Creates a new AI agent.
- `agents.getById`: Retrieves an agent's configuration by ID.
- `agents.update`: Updates an existing agent's configuration.
- `agents.delete`: Deletes an agent.
- `agents.list`: Lists all agents accessible to the user, with filtering options.
- `agents.assignTool`: Assigns a tool to an agent.
- `agents.removeTool`: Removes a tool from an agent.

## Integration with Omni-Agents Studio

This skill integrates with the Agent Builder UI, the Agent Marketplace, and the core task execution engine. It relies on the OpenRouter Manager skill for intelligent model selection and the Connector Manager skill for tool integration.
