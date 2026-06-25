/**
 * Skill Registry and Deduplication System
 * Manages skill registration, prevents duplicates, and consolidates overlapping capabilities
 */

interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  capabilities: string[];
  dependencies?: string[];
}

interface SkillRegistry {
  [skillId: string]: SkillMetadata;
}

class SkillRegistryManager {
  private registry: SkillRegistry = {};
  private capabilityIndex: Map<string, string[]> = new Map();

  /**
   * Register a new skill in the registry
   */
  registerSkill(skill: SkillMetadata): { success: boolean; message: string; merged?: boolean } {
    // Check for exact duplicates
    if (this.registry[skill.id]) {
      return {
        success: false,
        message: `Skill with ID "${skill.id}" already exists`,
      };
    }

    // Check for capability overlaps
    const overlappingSkills = this.findOverlappingSkills(skill);

    if (overlappingSkills.length > 0) {
      // Automatically merge overlapping skills
      this.mergeSkills(skill, overlappingSkills);
      return {
        success: true,
        message: `Skill registered and merged with ${overlappingSkills.length} overlapping skill(s)`,
        merged: true,
      };
    }

    // Register the skill
    this.registry[skill.id] = skill;
    this.updateCapabilityIndex(skill);

    return {
      success: true,
      message: `Skill "${skill.name}" registered successfully`,
    };
  }

  /**
   * Find skills with overlapping capabilities
   */
  private findOverlappingSkills(skill: SkillMetadata): string[] {
    const overlapping: string[] = [];
    const skillCapabilities = new Set(skill.capabilities);

    for (const [capId, skillIds] of Array.from(this.capabilityIndex.entries())) {
      if (skillCapabilities.has(capId)) {
        overlapping.push(...skillIds);
      }
    }

    return Array.from(new Set(overlapping));
  }

  /**
   * Merge overlapping skills into a consolidated skill
   */
  private mergeSkills(newSkill: SkillMetadata, existingSkillIds: string[]): void {
    const mergedCapabilities = new Set(newSkill.capabilities);
    const mergedDependencies = new Set(newSkill.dependencies || []);

    // Collect all capabilities and dependencies from overlapping skills
    for (const skillId of existingSkillIds) {
      const existingSkill = this.registry[skillId];
      if (existingSkill) {
        existingSkill.capabilities.forEach((cap) => mergedCapabilities.add(cap));
        (existingSkill.dependencies || []).forEach((dep) => mergedDependencies.add(dep));

        // Remove the old skill
        delete this.registry[skillId];
      }
    }

    // Create consolidated skill
    const consolidatedSkill: SkillMetadata = {
      ...newSkill,
      capabilities: Array.from(mergedCapabilities) as string[],
      dependencies: Array.from(mergedDependencies) as string[],
      version: this.incrementVersion(newSkill.version),
    };

    this.registry[consolidatedSkill.id] = consolidatedSkill;
    this.updateCapabilityIndex(consolidatedSkill);
  }

  /**
   * Update the capability index
   */
  private updateCapabilityIndex(skill: SkillMetadata): void {
    for (const capability of skill.capabilities) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, []);
      }
      const skillIds = this.capabilityIndex.get(capability);
      if (skillIds && !skillIds.includes(skill.id)) {
        skillIds.push(skill.id);
      }
    }
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split(".");
    const patch = parseInt(parts[2] || "0", 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Get all registered skills
   */
  getSkills(): SkillMetadata[] {
    return Object.values(this.registry);
  }

  /**
   * Get a specific skill by ID
   */
  getSkill(skillId: string): SkillMetadata | undefined {
    return this.registry[skillId];
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): SkillMetadata[] {
    return Object.values(this.registry).filter((skill) => skill.category === category);
  }

  /**
   * Get skills by capability
   */
  getSkillsByCapability(capability: string): SkillMetadata[] {
    const skillIds = this.capabilityIndex.get(capability) || [];
    return skillIds.map((id) => this.registry[id]).filter(Boolean);
  }

  /**
   * Remove a skill from the registry
   */
  removeSkill(skillId: string): { success: boolean; message: string } {
    if (!this.registry[skillId]) {
      return {
        success: false,
        message: `Skill with ID "${skillId}" not found`,
      };
    }

    const skill = this.registry[skillId];

    // Remove from capability index
    for (const capability of skill.capabilities) {
      const skillIds = this.capabilityIndex.get(capability);
      if (skillIds) {
        const index = skillIds.indexOf(skillId);
        if (index > -1) {
          skillIds.splice(index, 1);
        }
      }
    }

    delete this.registry[skillId];

    return {
      success: true,
      message: `Skill "${skill.name}" removed successfully`,
    };
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    totalSkills: number;
    totalCapabilities: number;
    skillsByCategory: Record<string, number>;
    topCapabilities: Array<{ capability: string; skillCount: number }>;
  } {
    const skillsByCategory: Record<string, number> = {};
    const skills = Object.values(this.registry);

    for (const skill of skills) {
      skillsByCategory[skill.category] = (skillsByCategory[skill.category] || 0) + 1;
    }

    const topCapabilities: Array<{ capability: string; skillCount: number }> = [];
    for (const [capability, skillIds] of Array.from(this.capabilityIndex.entries())) {
      topCapabilities.push({
        capability,
        skillCount: skillIds.length,
      });
    }
    topCapabilities.sort((a, b) => b.skillCount - a.skillCount);
    topCapabilities.splice(10);

    return {
      totalSkills: skills.length,
      totalCapabilities: this.capabilityIndex.size,
      skillsByCategory,
      topCapabilities,
    };
  }
}

// Export singleton instance
export const skillRegistry = new SkillRegistryManager();

// Pre-populate with the 10 bundled skills
const bundledSkills: SkillMetadata[] = [
  {
    id: "openrouter-manager",
    name: "OpenRouter Manager",
    description: "Manage OpenRouter configuration, model routing, and cost controls",
    category: "infrastructure",
    version: "1.0.0",
    capabilities: ["model-routing", "cost-control", "security-hardening", "performance-monitoring"],
  },
  {
    id: "agent-creator",
    name: "Agent Creator",
    description: "Create and configure AI agents with custom personalities and tools",
    category: "agents",
    version: "1.0.0",
    capabilities: ["agent-design", "system-prompt-management", "tool-assignment", "model-selection"],
  },
  {
    id: "skill-creator",
    name: "Skill Creator",
    description: "Create and manage custom AI skills with structured schemas",
    category: "skills",
    version: "1.0.0",
    capabilities: ["skill-definition", "schema-management", "versioning", "marketplace-publishing"],
  },
  {
    id: "knowledge-base-manager",
    name: "Knowledge Base Manager",
    description: "Manage documents, embeddings, and semantic search across knowledge layers",
    category: "knowledge",
    version: "1.0.0",
    capabilities: ["document-management", "semantic-search", "rag-support", "memory-retrieval"],
  },
  {
    id: "workspace-manager",
    name: "Workspace Manager",
    description: "Manage workspaces, team members, and access control",
    category: "collaboration",
    version: "1.0.0",
    capabilities: ["workspace-management", "member-management", "access-control", "audit-logging"],
  },
  {
    id: "automation-builder",
    name: "Automation Builder",
    description: "Build automated workflows with triggers, actions, and integrations",
    category: "automation",
    version: "1.0.0",
    capabilities: ["trigger-definition", "action-sequencing", "agent-integration", "execution-monitoring"],
  },
  {
    id: "connector-manager",
    name: "Connector Manager",
    description: "Manage connections to external services and APIs",
    category: "integrations",
    version: "1.0.0",
    capabilities: ["connector-registration", "credential-storage", "data-mapping", "action-execution"],
  },
  {
    id: "model-routing-optimizer",
    name: "Model Routing Optimizer",
    description: "Intelligently route requests to optimal LLMs based on task complexity",
    category: "infrastructure",
    version: "1.0.0",
    capabilities: ["dynamic-routing", "cost-optimization", "fallback-mechanisms", "preset-application"],
    dependencies: ["openrouter-manager"],
  },
  {
    id: "cost-optimizer",
    name: "Cost Optimizer",
    description: "Monitor, analyze, and optimize AI model usage costs",
    category: "infrastructure",
    version: "1.0.0",
    capabilities: ["cost-tracking", "budget-management", "alerting", "cost-estimation"],
    dependencies: ["openrouter-manager"],
  },
  {
    id: "security-auditor",
    name: "Security Auditor",
    description: "Audit and enforce security policies for AI interactions",
    category: "security",
    version: "1.0.0",
    capabilities: ["api-key-protection", "prompt-injection-prevention", "sensitive-data-detection", "audit-logging"],
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Organize and manage projects with associated resources",
    category: "projects",
    version: "1.0.0",
    capabilities: ["project-creation", "resource-linking", "project-organization", "access-control"],
  },
];

// Initialize registry with bundled skills
for (const skill of bundledSkills) {
  skillRegistry.registerSkill(skill);
}
