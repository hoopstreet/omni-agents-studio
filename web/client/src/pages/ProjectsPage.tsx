import { useState } from "react";
import { Plus, Search, Settings, Trash2, ChevronRight } from "lucide-react";
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

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  chats: number;
  agents: number;
  tasks: number;
  createdAt: Date;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Omni Agents Studio",
    description: "Main platform development and features",
    color: "#3b82f6",
    icon: "🚀",
    chats: 12,
    agents: 5,
    tasks: 23,
    createdAt: new Date(Date.now() - 86400000 * 30),
  },
  {
    id: "2",
    name: "Launch Desk",
    description: "Release and deployment planning",
    color: "#8b5cf6",
    icon: "🎯",
    chats: 8,
    agents: 3,
    tasks: 15,
    createdAt: new Date(Date.now() - 86400000 * 14),
  },
  {
    id: "3",
    name: "Organization Security",
    description: "Security audit and compliance",
    color: "#ef4444",
    icon: "🔒",
    chats: 5,
    agents: 2,
    tasks: 8,
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      color: "#3b82f6",
      icon: "📁",
      chats: 0,
      agents: 0,
      tasks: 0,
      createdAt: new Date(),
    };

    setProjects([...projects, newProject]);
    setNewProjectName("");
    setNewProjectDescription("");
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-slate-50">Projects</h1>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Organize your chats, agents, and tasks in a project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="e.g., Marketing Campaign"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Describe your project..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="min-h-24"
                  />
                </div>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-title">No projects found</div>
              <div className="empty-state-description">
                {projects.length === 0
                  ? "Create your first project to get started"
                  : "Try adjusting your search"}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="card-interactive group flex flex-col gap-4 p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="text-2xl"
                        style={{ color: project.color }}
                      >
                        {project.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-50 truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Created{" "}
                          {project.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Settings size={16} />
                    </Button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{project.chats} chats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🤖</span>
                      <span>{project.agents} agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>{project.tasks} tasks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <ChevronRight size={14} />
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProject(project.id)}
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
