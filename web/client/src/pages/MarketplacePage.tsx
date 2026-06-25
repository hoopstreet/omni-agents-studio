import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Download, TrendingUp, Search } from "lucide-react";

interface MarketplaceItem {
  id: number;
  type: "agent" | "skill" | "prompt" | "template";
  name: string;
  description: string;
  icon: string;
  authorName: string;
  version: string;
  category: string;
  tags: string[];
  featured: boolean;
  verified: boolean;
  downloads: number;
  rating: number;
  reviewCount: number;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"agent" | "skill" | "prompt" | "template" | "all">("all");

  const mockItems: MarketplaceItem[] = [
    {
      id: 1,
      type: "agent",
      name: "Research Agent Pro",
      description: "Advanced research agent with web search and analysis capabilities",
      icon: "🔍",
      authorName: "Omni Team",
      version: "1.0.0",
      category: "research",
      tags: ["research", "web-search", "analysis"],
      featured: true,
      verified: true,
      downloads: 1250,
      rating: 4.8,
      reviewCount: 45,
    },
    {
      id: 2,
      type: "skill",
      name: "Email Automation Skill",
      description: "Send and manage emails with AI-powered composition",
      icon: "✉️",
      authorName: "Omni Team",
      version: "1.0.0",
      category: "automation",
      tags: ["email", "automation", "gmail"],
      featured: false,
      verified: true,
      downloads: 890,
      rating: 4.6,
      reviewCount: 32,
    },
    {
      id: 3,
      type: "prompt",
      name: "Creative Writing Prompt",
      description: "Generate creative writing with style and tone control",
      icon: "✍️",
      authorName: "Community",
      version: "1.0.0",
      category: "writing",
      tags: ["writing", "creative", "prompts"],
      featured: false,
      verified: true,
      downloads: 650,
      rating: 4.7,
      reviewCount: 28,
    },
    {
      id: 4,
      type: "template",
      name: "Customer Support Template",
      description: "Ready-to-use customer support workflow template",
      icon: "💬",
      authorName: "Omni Team",
      version: "1.0.0",
      category: "support",
      tags: ["support", "template", "customer-service"],
      featured: true,
      verified: true,
      downloads: 1100,
      rating: 4.9,
      reviewCount: 52,
    },
  ];

  const filteredItems = mockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}
          />
        ))}
        <span className="text-xs text-slate-400 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Omni Marketplace</h1>
        <p className="text-slate-400">Discover and install agents, skills, prompts, and templates</p>
      </div>

      {/* Search and Filter */}
      <div className="border-b border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="agent">Agents</TabsTrigger>
            <TabsTrigger value="skill">Skills</TabsTrigger>
            <TabsTrigger value="prompt">Prompts</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{item.icon}</div>
                  {item.featured && <Badge className="bg-blue-600">Featured</Badge>}
                  {item.verified && <Badge className="bg-green-600">Verified</Badge>}
                </div>
                <CardTitle className="text-white">{item.name}</CardTitle>
                <CardDescription className="text-slate-400">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">by {item.authorName}</span>
                  <span className="text-slate-400">v{item.version}</span>
                </div>

                {renderStars(item.rating)}

                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Download size={14} />
                  <span>{item.downloads} downloads</span>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Install
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-slate-400 text-lg">No items found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
