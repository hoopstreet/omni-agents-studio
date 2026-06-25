# Workspace Manager Skill

## Description

This skill provides robust management capabilities for user workspaces within Omni-Agents Studio, facilitating collaboration, access control, and organizational structure. It allows for the creation, configuration, and administration of workspaces, including member management and audit logging.

## Capabilities

- **Workspace Creation & Management:** Create new workspaces and manage their core properties like name, description, and settings.
- **Member Management:** Add, remove, and update roles for workspace members, supporting `admin`, `editor`, and `viewer` roles.
- **Access Control:** Implement role-based access control (RBAC) to define permissions within each workspace.
- **Workspace Settings:** Configure workspace-specific settings and preferences.
- **Audit Logging:** Track significant actions and changes within a workspace for security and compliance purposes.

## Usage

Users interact with this skill through the Workspace Management panel in Omni-Agents Studio. This interface allows them to:

- Create and configure new workspaces.
- Invite and manage members, assigning appropriate roles.
- Review audit logs to monitor activity within their workspaces.
- Adjust workspace settings to suit their team's needs.

### Configuration

Workspace data is stored in the `workspaces` and `workspaceMembers` tables in the database. The `auditLogs` table records all significant actions.

### API Endpoints (tRPC Procedures)

- `workspaces.create`: Creates a new workspace.
- `workspaces.getById`: Retrieves workspace details by ID.
- `workspaces.update`: Updates workspace properties.
- `workspaces.delete`: Deletes a workspace.
- `workspaces.addMember`: Adds a user to a workspace with a specified role.
- `workspaces.removeMember`: Removes a user from a workspace.
- `workspaces.updateMemberRole`: Changes a member's role within a workspace.
- `auditLogs.list`: Retrieves audit logs for a specific workspace.

## Integration with Omni-Agents Studio

This skill integrates deeply with the user authentication system for member management and the project system for associating projects with workspaces. It provides the foundational structure for team collaboration and enterprise governance within Omni-Agents Studio.
