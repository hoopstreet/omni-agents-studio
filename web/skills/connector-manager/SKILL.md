# Connector Manager Skill

## Description

This skill provides a centralized system for managing connections to external services and tools, enabling AI agents to seamlessly read data, write data, and execute actions across various platforms. It ensures secure credential handling and facilitates data exchange with third-party applications.

## Capabilities

- **Connector Registration:** Register and manage various types of connectors (e.g., Google Drive, Notion, GitHub, Supabase, Postman, Shopify, Figma).
- **Secure Credential Storage:** Safely store and manage API keys, OAuth tokens, and other credentials required for external service access.
- **Data Mapping & Transformation:** Define how data is exchanged between Omni-Agents Studio and connected services, including mapping and transformation rules.
- **Action Execution:** Enable AI agents to execute specific actions (e.g., send emails, update Notion pages, commit to GitHub) through configured connectors.
- **Health Monitoring:** Monitor the status and health of connected services and their associated credentials.
- **Access Control:** Manage which agents or projects have access to specific connectors.

## Usage

Users interact with this skill through the "Connectors" section of Omni-Agents Studio. They can:

- Add new connectors and configure their authentication details.
- View and manage existing connectors.
- Test connector functionality.
- Assign connectors to specific projects or agents.

AI agents utilize this skill to perform actions that require interaction with external services, abstracting away the complexity of API calls and authentication.

### Configuration

Connector configurations, including their type, settings, and references to securely stored credentials, are managed within the database. Sensitive credentials are encrypted and stored in a secrets vault, not directly in the database.

### API Endpoints (tRPC Procedures)

- `connectors.register`: Registers a new connector with its configuration and credentials.
- `connectors.getById`: Retrieves details of a specific connector.
- `connectors.update`: Updates the configuration or credentials of an existing connector.
- `connectors.delete`: Deletes a connector.
- `connectors.list`: Lists all configured connectors accessible to the user or project.
- `connectors.executeAction`: Executes a predefined action through a specified connector, with dynamic parameters.

## Integration with Omni-Agents Studio

This skill is a fundamental component for extending the capabilities of Omni-Agents Studio. It integrates tightly with the Agent System (allowing agents to use connectors as tools), the Automation Builder (enabling external actions in workflows), and the Project System (for project-specific connector access).
