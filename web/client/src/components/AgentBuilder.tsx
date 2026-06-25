import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Save } from "lucide-react";
import { toast } from "sonner";

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  tools: string[];
  maxTokens: number;
}

interface AgentBuilderProps {
  onSave?: (config: AgentConfig) => void;
  initialConfig?: Partial<AgentConfig>;
}

const AVAILABLE_TOOLS = [
  { id: "web_search", name: "Web Search", description: "Search the internet for information" },
  { id: "code_execution", name: "Code Execution", description: "Execute Python code" },
  { id: "file_operations", name: "File Operations", description: "Read and write files" },
  { id: "api_calls", name: "API Calls", description: "Make HTTP requests to APIs" },
  { id: "database_query", name: "Database Query", description: "Query databases" },
  { id: "terminal_commands", name: "Terminal Commands", description: "Execute shell commands" },
  { id: "email_sending", name: "Email Sending", description: "Send emails" },
  { id: "calendar_management", name: "Calendar Management", description: "Manage calendar events" },
  { id: "knowledge_retrieval", name: "Knowledge Retrieval", description: "Query knowledge base" },
  { id: "task_creation", name: "Task Creation", description: "Create and manage tasks" },
];

const AVAILABLE_MODELS = [
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", speed: "Fast", cost: "High" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", speed: "Medium", cost: "Medium" },
  { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", speed: "Fast", cost: "Low" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", speed: "Slow", cost: "Low" },
  { id: "auto", name: "Auto (Smart Routing)", provider: "Manus", speed: "Adaptive", cost: "Balanced" },
];

export function AgentBuilder({ onSave, initialConfig }: AgentBuilderProps) {
  const [config, setConfig] = useState<AgentConfig>({
    name: initialConfig?.name || "",
    description: initialConfig?.description || "",
    model: initialConfig?.model || "auto",
    systemPrompt: initialConfig?.systemPrompt || "",
    temperature: initialConfig?.temperature || 0.7,
    tools: initialConfig?.tools || [],
    maxTokens: initialConfig?.maxTokens || 2000,
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleNameChange = (value: string) => {
    setConfig({ ...config, name: value });
  };

  const handleDescriptionChange = (value: string) => {
    setConfig({ ...config, description: value });
  };

  const handleSystemPromptChange = (value: string) => {
    setConfig({ ...config, systemPrompt: value });
  };

  const handleModelChange = (value: string) => {
    setConfig({ ...config, model: value });
  };

  const handleTemperatureChange = (value: string) => {
    setConfig({ ...config, temperature: parseFloat(value) });
  };

  const handleMaxTokensChange = (value: string) => {
    setConfig({ ...config, maxTokens: parseInt(value) });
  };

  const toggleTool = (toolId: string) => {
    setConfig({
      ...config,
      tools: config.tools.includes(toolId)
        ? config.tools.filter((t) => t !== toolId)
        : [...config.tools, toolId],
    });
  };

  const handleSave = () => {
    if (!config.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!config.systemPrompt.trim()) {
      toast.error("System prompt is required");
      return;
    }

    onSave?.(config);
    toast.success("Agent configuration saved");
  };

  const handleDuplicate = () => {
    const newConfig = { ...config, name: `${config.name} (Copy)` };
    setConfig(newConfig);
    toast.success("Configuration duplicated");
  };

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === config.model);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="tools">Tools & Settings</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="agent-name">Agent Name *</Label>
            <Input
              id="agent-name"
              placeholder="e.g., Research Agent, Code Assistant"
              value={config.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              placeholder="Describe what this agent does..."
              value={config.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="agent-model">Model *</Label>
            <Select value={config.model} onValueChange={handleModelChange}>
              <SelectTrigger id="agent-model" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <span className="text-xs text-gray-400">({model.provider})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedModel && (
              <div className="mt-3 p-3 bg-slate-900 rounded text-sm space-y-1">
                <p>
                  <strong>Provider:</strong> {selectedModel.provider}
                </p>
                <p>
                  <strong>Speed:</strong> {selectedModel.speed}
                </p>
                <p>
                  <strong>Cost:</strong> {selectedModel.cost}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* System Prompt Tab */}
        <TabsContent value="prompt" className="space-y-4">
          <div>
            <Label htmlFor="system-prompt">System Prompt *</Label>
            <p className="text-xs text-gray-400 mt-1 mb-2">
              Define how the agent should behave and what role it should take
            </p>
            <Textarea
              id="system-prompt"
              placeholder="You are a helpful research assistant. Your role is to..."
              value={config.systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              className="min-h-40 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature: {config.temperature.toFixed(1)}</Label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleTemperatureChange(e.target.value)}
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                {config.temperature < 0.5 && "Deterministic (precise)"}
                {config.temperature >= 0.5 && config.temperature < 1.5 && "Balanced (creative)"}
                {config.temperature >= 1.5 && "Creative (random)"}
              </p>
            </div>

            <div>
              <Label htmlFor="max-tokens">Max Tokens: {config.maxTokens}</Label>
              <input
                id="max-tokens"
                type="range"
                min="100"
                max="4000"
                step="100"
                value={config.maxTokens}
                onChange={(e) => handleMaxTokensChange(e.target.value)}
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">Response length limit</p>
            </div>
          </div>
        </TabsContent>

        {/* Tools & Settings Tab */}
        <TabsContent value="tools" className="space-y-4">
          <div>
            <Label>Available Tools</Label>
            <p className="text-xs text-gray-400 mt-1 mb-3">
              Select which tools this agent can use
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_TOOLS.map((tool) => (
                <Card
                  key={tool.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    config.tools.includes(tool.id)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={config.tools.includes(tool.id)}
                      onCheckedChange={() => toggleTool(tool.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-400">{tool.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label>Selected Tools ({config.tools.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.tools.length === 0 ? (
                <p className="text-sm text-gray-400">No tools selected</p>
              ) : (
                config.tools.map((toolId) => {
                  const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);
                  return (
                    <Badge key={toolId} variant="secondary" className="gap-1">
                      {tool?.name}
                      <button
                        onClick={() => toggleTool(toolId)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      {showPreview && (
        <Card className="p-4 bg-slate-900 border-gray-600">
          <h3 className="font-semibold mb-3">Configuration Preview</h3>
          <pre className="text-xs overflow-auto bg-slate-950 p-3 rounded text-gray-300">
            {JSON.stringify(config, null, 2)}
          </pre>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Agent
        </Button>
        <Button variant="outline" onClick={handleDuplicate} className="gap-2">
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          {showPreview ? "Hide" : "Show"} Preview
        </Button>
      </div>
    </div>
  );
}
