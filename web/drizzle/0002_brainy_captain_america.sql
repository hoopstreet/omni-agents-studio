CREATE TABLE `agentTeamMembers` (
	`teamId` int NOT NULL,
	`agentId` int NOT NULL,
	`role` enum('supervisor','worker') DEFAULT 'worker'
);
--> statement-breakpoint
CREATE TABLE `agentTeams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`supervisorAgentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentTeams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`testName` varchar(255) NOT NULL,
	`testPrompt` text NOT NULL,
	`expectedOutput` text,
	`actualOutput` text,
	`costEstimate` varchar(20),
	`latency` int,
	`qualityScore` varchar(10),
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`version` int NOT NULL,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`eventType` varchar(100),
	`userId` int,
	`agentId` int,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255),
	`type` varchar(100),
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`key` varchar(255) NOT NULL,
	`permissions` json,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255),
	`resourceType` varchar(100),
	`resourceId` int,
	`changes` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`result` json,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationWorkflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` varchar(100),
	`triggerConfig` json,
	`actions` json,
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationWorkflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectorSyncs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectorId` int NOT NULL,
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`itemsProcessed` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `connectorSyncs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`type` varchar(100),
	`name` varchar(255),
	`config` json,
	`credentials` json,
	`status` enum('connected','disconnected','error') DEFAULT 'disconnected',
	`lastSync` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentSummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`summary` text,
	`keywords` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentSummaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `documentSummaries_documentId_unique` UNIQUE(`documentId`)
);
--> statement-breakpoint
CREATE TABLE `documentTags` (
	`documentId` int NOT NULL,
	`tagId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`version` int NOT NULL,
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `documentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeGraph` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`source` varchar(255),
	`target` varchar(255),
	`relationship` varchar(100),
	`weight` varchar(10),
	CONSTRAINT `knowledgeGraph_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tag` varchar(100) NOT NULL,
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledgeTags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('agent','skill','prompt','template') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`author` int,
	`rating` varchar(10),
	`downloads` int DEFAULT 0,
	`verified` boolean DEFAULT false,
	`featured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memoryStore` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('user','agent','workspace'),
	`entityId` int,
	`key` varchar(255),
	`value` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memoryStore_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelBenchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model` varchar(100),
	`taskType` varchar(100),
	`avgLatency` int,
	`avgCost` varchar(20),
	`qualityScore` varchar(10),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modelBenchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelRoutingConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`taskType` varchar(100),
	`preferredModel` varchar(100),
	`fallbackModels` json,
	`costLimit` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modelRoutingConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`definition` json,
	`status` enum('draft','active','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaceMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','editor','viewer') DEFAULT 'viewer',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspaceMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
