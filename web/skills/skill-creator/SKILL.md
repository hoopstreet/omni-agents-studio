# Skill Creator Skill

## Description

This skill provides a comprehensive framework for users to create, manage, and publish custom AI skills within Omni-Agents Studio. It facilitates the definition of skill metadata, input/output schemas, system prompts, and parameters, enabling the extension of agent capabilities.

## Capabilities

- **Skill Definition:** Define new skills with unique names, descriptions, categories, and associated system prompts.
- **Schema Management:** Specify input and output schemas for skills, ensuring structured data exchange with agents and other systems.
- **Parameter Configuration:** Configure parameters for skill execution, allowing for flexible and dynamic behavior.
- **Versioning:** Manage different versions of a skill, supporting iterative development and deployment.
- **Marketplace Publishing:** Publish skills to the Omni-Agents Studio marketplace, making them discoverable and usable by other users.
- **Import/Export:** Support for importing and exporting skill definitions for sharing and backup purposes.

## Usage

Users interact with this skill primarily through the Skill Builder interface in Omni-Agents Studio. This interface allows them to:

- Create new skills from scratch.
- Edit existing skill definitions, including their system prompts, schemas, and parameters.
- Manage skill versions and track changes.
- Publish skills to the marketplace or keep them private within their workspace.
- Import skill definitions from external sources or export their own skills.

### Configuration

Skill definitions and their versions are stored in the `skills` and `skillVersions` tables in the database. Key fields include `name`, `description`, `category`, `systemPrompt`, `inputSchema`, `outputSchema`, and `parameters`.

### API Endpoints (tRPC Procedures)

- `skills.create`: Creates a new skill.
- `skills.getById`: Retrieves a skill's definition by ID.
- `skills.update`: Updates an existing skill's definition.
- `skills.createVersion`: Creates a new version for an existing skill.
- `skills.publish`: Publishes a skill to the marketplace.
- `skills.list`: Lists all skills accessible to the user, with filtering options.

## Integration with Omni-Agents Studio

This skill is a core component of the Omni-Agents Studio Skill System, integrating with the Agent Builder to allow agents to utilize defined skills, and with the Skill Marketplace for discovery and distribution. It ensures that skills are properly structured and managed throughout their lifecycle.
