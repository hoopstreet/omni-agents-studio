import { useState } from "react";
import { Plus, Search, Play, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgentBuilder } from "@/components/AgentBuilder";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: "idle" | "running" | "paused";
  category: string;
}

const AGENT_CATEGORIES = [
  "All",
  "Business",
  "Marketing",
  "Development",
  "Research",
  "Security",
  "Creative",
  "Operations",
];

const SAMPLE_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Launch Desk",
    description: "Release & Deployment Planner",
    model: "auto",
    status: "idle",
    category: "Operations",
  },
  {
    id: "2",
    name: "Research Agent",
    description: "Deep research and analysis",
    model: "gpt-5",
    status: "idle",
    category: "Research",
  },
  {
    id: "3",
    name: "Developer Agent",
    description: "Code generation and debugging",
    model: "claude-sonnet",
    status: "idle",
    category: "Development",
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("");
  const [useAdvancedBuilder, setUseAdvancedBuilder] = useState(false);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: newAgentName,
      description: newAgentPrompt,
      model: "auto",
      status: "idle",
      category: "Custom",
    };

    setAgents([...agents, newAgent]);
    setNewAgentName("");
    setNewAgentPrompt("");
    setIsCreateDialogOpen(false);
    toast.success("Agent created successfully");
  };

  const handleAgentBuilderSave = (config: any) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: config.name,
      description: config.description,
      model: config.model,
      status: "idle",
      category: "Custom",
    };

    setAgents([...agents, newAgent]);
    setIsCreateDialogOpen(false);
    setUseAdvancedBuilder(false);
    toast.success("Agent created with custom configuration");
  };

  const handleRunAgent = (agentId: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: "running" } : agent
      )
    );
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter((agent) => agent.id !== agentId));
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-slate-50">Agents</h1>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className={useAdvancedBuilder ? "sm:max-w-[700px]" : ""}>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  {useAdvancedBuilder
                    ? "Use the advanced builder to configure your agent with tools and settings"
                    : "Define a new AI agent with a name and system prompt"}
                </DialogDescription>
              </DialogHeader>

              {!useAdvancedBuilder ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      placeholder="e.g., Research Agent"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent-prompt">System Prompt</Label>
                    <Textarea
                      id="agent-prompt"
                      placeholder="Define the agent's behavior and capabilities..."
                      value={newAgentPrompt}
                      onChange={(e) => setNewAgentPrompt(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAgent} className="flex-1">
                      Create Agent
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUseAdvancedBuilder(true)}
                      className="flex-1"
                    >
                      Advanced Builder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <AgentBuilder onSave={handleAgentBuilderSave} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="w-full sm:w-auto">
            <div className="flex gap-2 pb-2">
              {AGENT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Agents Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {filteredAgents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div>
              <div className="empty-state-title">No agents found</div>
              <div className="empty-state-description">
                {agents.length === 0
                  ? "Create your first agent to get started"
                  : "Try adjusting your search or filters"}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="card-interactive flex flex-col gap-3 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-50">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {agent.category}
                      </p>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        agent.status === "running"
                          ? "bg-green-500 animate-pulse"
                          : "bg-slate-800"
                      }`}
                    />
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleRunAgent(agent.id)}
                      disabled={agent.status === "running"}
                    >
                      <Play size={14} />
                      Run
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Settings size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
