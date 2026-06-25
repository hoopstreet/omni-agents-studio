# Automation Builder Skill

## Description

This skill enables users to create, manage, and execute automated workflows within Omni-Agents Studio. It provides tools to define triggers, sequence actions, and integrate with agents and connectors to build powerful automation solutions.

## Capabilities

- **Trigger Definition:** Configure various triggers for automations, including scheduled (cron), event-based, and webhook triggers.
- **Action Sequencing:** Design multi-step workflows by chaining actions, which can involve AI agents, external connectors, or internal system operations.
- **Agent Integration:** Incorporate AI agents into workflows to perform intelligent tasks, such as data processing, content generation, or decision-making.
- **Connector Integration:** Utilize configured connectors to interact with external services, APIs, and data sources within automated workflows.
- **Execution Monitoring:** Monitor the status and logs of automated workflow executions.
- **Enable/Disable Control:** Easily enable or disable automations as needed.

## Usage

Users interact with this skill through the Automation Builder interface in Omni-Agents Studio. They can:

- Create new automation workflows by defining triggers and actions.
- Edit existing workflows to modify their logic or integrations.
- View execution history and logs to troubleshoot or analyze performance.
- Activate or deactivate automations.

### Configuration

Automation workflows are stored in the `automationWorkflows` table in the database. Key fields include `name`, `trigger`, `triggerConfig`, `actions`, and `enabled`.

### API Endpoints (tRPC Procedures)

- `automations.create`: Creates a new automation workflow.
- `automations.getById`: Retrieves an automation workflow by ID.
- `automations.update`: Updates an existing automation workflow.
- `automations.delete`: Deletes an automation workflow.
- `automations.list`: Lists all automation workflows accessible to the user.
- `automations.enable`: Enables a specific automation workflow.
- `automations.disable`: Disables a specific automation workflow.

## Integration with Omni-Agents Studio

This skill integrates with the Scheduled Tasks system for time-based triggers, the Agent System for agent-driven actions, and the Connector Manager for external service interactions. It forms the backbone of the automation platform within Omni-Agents Studio.
