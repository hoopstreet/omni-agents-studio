import { useState } from "react";
import { Search, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "agent" | "prompt" | "workflow";
  downloads: number;
  rating: number;
  icon: string;
}

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Research Agent",
    description: "Deep research and competitive analysis",
    category: "Research",
    type: "agent",
    downloads: 1250,
    rating: 4.8,
    icon: "🔍",
  },
  {
    id: "2",
    name: "Developer Agent",
    description: "Code generation and debugging",
    category: "Development",
    type: "agent",
    downloads: 980,
    rating: 4.9,
    icon: "💻",
  },
  {
    id: "3",
    name: "Marketing Copywriter",
    description: "Generate marketing copy and campaigns",
    category: "Marketing",
    type: "agent",
    downloads: 750,
    rating: 4.7,
    icon: "📝",
  },
  {
    id: "4",
    name: "Customer Support",
    description: "Handle customer inquiries and support",
    category: "Operations",
    type: "agent",
    downloads: 620,
    rating: 4.6,
    icon: "🎧",
  },
];

const CATEGORIES = [
  "All",
  "Business",
  "Marketing",
  "Development",
  "Research",
  "Security",
  "Creative",
  "Operations",
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templateType, setTemplateType] = useState<"agent" | "prompt" | "workflow">("agent");

  const filteredTemplates = SAMPLE_TEMPLATES.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesType = template.type === templateType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCloneTemplate = (templateId: string) => {
    // Handle template cloning
    console.log("Cloning template:", templateId);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-50">Library</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
        <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agent">Agents</TabsTrigger>
            <TabsTrigger value="prompt">Prompts</TabsTrigger>
            <TabsTrigger value="workflow">Workflows</TabsTrigger>
          </TabsList>
        </Tabs>
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
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="w-full sm:w-auto">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map((category) => (
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

      {/* Templates Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No templates found</div>
              <div className="empty-state-description">
                Try adjusting your search or filters
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="card-interactive flex flex-col gap-3 p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex items-center gap-1 badge-default">
                      <Star size={12} className="fill-current" />
                      <span>{template.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-50">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Download size={14} />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleCloneTemplate(template.id)}
                    >
                      Clone
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
