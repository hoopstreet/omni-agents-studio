import { useState } from "react";
import { Search, ChevronDown, Trash2, Eye } from "lucide-react";
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
} from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  agent: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  createdAt: Date;
  logs: string[];
}

const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "Deploy Release v1.2.0",
    agent: "Launch Desk",
    status: "completed",
    progress: 100,
    createdAt: new Date(Date.now() - 3600000),
    logs: [
      "[INFO] Starting deployment process",
      "[INFO] Building application",
      "[INFO] Running tests",
      "[INFO] Deployment successful",
    ],
  },
  {
    id: "2",
    title: "Analyze Market Trends",
    agent: "Research Agent",
    status: "running",
    progress: 65,
    createdAt: new Date(Date.now() - 1800000),
    logs: [
      "[INFO] Fetching market data",
      "[INFO] Processing 2,500 data points",
      "[INFO] 65% complete",
    ],
  },
  {
    id: "3",
    title: "Fix Critical Bug",
    agent: "Developer Agent",
    status: "pending",
    progress: 0,
    createdAt: new Date(),
    logs: ["[INFO] Task queued"],
  },
];

const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-400",
  running: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
};

const STATUS_ICONS = {
  pending: "⏳",
  running: "⚙️",
  completed: "✅",
  failed: "❌",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewLogs = (task: Task) => {
    setSelectedTask(task);
    setIsLogDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const statusCounts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    running: tasks.filter((t) => t.status === "running").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-50">Tasks</h1>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(null)}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={selectedStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("pending")}
          >
            Pending ({statusCounts.pending})
          </Button>
          <Button
            variant={selectedStatus === "running" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("running")}
          >
            Running ({statusCounts.running})
          </Button>
          <Button
            variant={selectedStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("completed")}
          >
            Completed ({statusCounts.completed})
          </Button>
          <Button
            variant={selectedStatus === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("failed")}
          >
            Failed ({statusCounts.failed})
          </Button>
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4 sm:p-6">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No tasks found</div>
              <div className="empty-state-description">
                {tasks.length === 0
                  ? "Run an agent to create tasks"
                  : "Try adjusting your search or filters"}
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="card-interactive flex flex-col gap-3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {STATUS_ICONS[task.status]}
                      </span>
                      <h3 className="font-semibold text-slate-50 truncate">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {task.agent} • {task.createdAt.toLocaleTimeString()}
                    </p>
                  </div>

                  <div
                    className={`badge-default ${
                      STATUS_COLORS[task.status]
                    } whitespace-nowrap`}
                  >
                    {task.status}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleViewLogs(task)}
                  >
                    <Eye size={14} />
                    View Logs
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Logs: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Real-time execution logs for this task
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto">
            {selectedTask?.logs.map((log, idx) => (
              <div key={idx} className="text-slate-400 py-1">
                {log}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
