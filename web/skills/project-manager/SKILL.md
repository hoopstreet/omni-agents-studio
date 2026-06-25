# Project Manager Skill

## Description

This skill provides comprehensive management capabilities for projects within Omni-Agents Studio. It allows users to create, organize, and oversee all project-related resources, including chats, files, knowledge, agents, tasks, skills, connectors, instructions, workflows, and automations.

## Capabilities

- **Project Creation & Management:** Create, update, and delete projects, defining their name, description, icon, and color.
- **Resource Linking:** Associate various Omni-Agents Studio resources (Chats, Files, Knowledge, Agents, Tasks, Skills, Connectors, Instructions, Workflows, Automations) with specific projects.
- **Project Organization:** Organize projects into categories or groups for better management and discoverability.
- **Access Control:** Manage project access and permissions for team members.
- **Project Overview:** Provide a consolidated view of all resources and activities related to a project.

## Usage

Users interact with this skill primarily through the "Projects" section of Omni-Agents Studio. They can:

- Create new projects to organize their work.
- View and manage all resources linked to a project.
- Update project details and settings.
- Collaborate with team members on projects.

### Configuration

Project data is stored in the `projects` table in the database. Relationships to other resources (chats, agents, tasks, etc.) are managed through foreign keys or linking tables.

### API Endpoints (tRPC Procedures)

- `projects.create`: Creates a new project.
- `projects.getById`: Retrieves project details by ID.
- `projects.update`: Updates an existing project.
- `projects.delete`: Deletes a project and its associated resources.
- `projects.list`: Lists all projects accessible to the user, with filtering options.
- `projects.addResource`: Links a resource (e.g., chat, agent) to a project.
- `projects.removeResource`: Unlinks a resource from a project.

## Integration with Omni-Agents Studio

This skill is a central organizing principle within Omni-Agents Studio, integrating with virtually all other core systems. It provides context for agents, tasks, knowledge, and automations, ensuring that all work is structured and easily accessible within a project framework.
