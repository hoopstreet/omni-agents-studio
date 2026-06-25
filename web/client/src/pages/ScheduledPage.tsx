import { useState } from "react";
import { Plus, Search, Play, Pause, Trash2, Clock, Eye } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduledJob {
  id: string;
  name: string;
  agent: string;
  cronExpression: string;
  isEnabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  description: string;
}

const SAMPLE_JOBS: ScheduledJob[] = [
  {
    id: "1",
    name: "Daily Market Analysis",
    agent: "Research Agent",
    cronExpression: "0 9 * * *",
    isEnabled: true,
    lastRun: new Date(Date.now() - 3600000),
    nextRun: new Date(Date.now() + 82800000),
    description: "Analyze market trends every morning at 9 AM",
  },
  {
    id: "2",
    name: "Weekly Security Audit",
    agent: "Security Agent",
    cronExpression: "0 0 * * 0",
    isEnabled: true,
    lastRun: new Date(Date.now() - 604800000),
    nextRun: new Date(Date.now() + 604800000),
    description: "Run security audit every Sunday at midnight",
  },
  {
    id: "3",
    name: "Hourly Data Sync",
    agent: "Developer Agent",
    cronExpression: "0 * * * *",
    isEnabled: false,
    lastRun: new Date(Date.now() - 7200000),
    description: "Sync data every hour",
  },
];

const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at 9 AM", value: "0 9 * * *" },
  { label: "Every Monday", value: "0 0 * * 1" },
  { label: "Every month", value: "0 0 1 * *" },
];

export default function ScheduledPage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>(SAMPLE_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobAgent, setNewJobAgent] = useState("research-agent");
  const [newJobCron, setNewJobCron] = useState("0 9 * * *");
  const [newJobDescription, setNewJobDescription] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateJob = () => {
    if (!newJobName.trim()) return;

    const newJob: ScheduledJob = {
      id: Date.now().toString(),
      name: newJobName,
      agent: newJobAgent,
      cronExpression: newJobCron,
      isEnabled: true,
      description: newJobDescription,
      nextRun: new Date(Date.now() + 3600000),
    };

    setJobs([...jobs, newJob]);
    setNewJobName("");
    setNewJobAgent("research-agent");
    setNewJobCron("0 9 * * *");
    setNewJobDescription("");
    setIsCreateDialogOpen(false);
  };

  const handleToggleJob = (jobId: string) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, isEnabled: !job.isEnabled } : job
      )
    );
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const formatCronExpression = (cron: string): string => {
    const presets = CRON_PRESETS.find((p) => p.value === cron);
    return presets ? presets.label : cron;
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-slate-50">Scheduled Jobs</h1>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scheduled Job</DialogTitle>
                <DialogDescription>
                  Set up a recurring agent task
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-name">Job Name</Label>
                  <Input
                    id="job-name"
                    placeholder="e.g., Daily Report"
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="job-agent">Agent</Label>
                  <Select value={newJobAgent} onValueChange={setNewJobAgent}>
                    <SelectTrigger id="job-agent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="research-agent">Research Agent</SelectItem>
                      <SelectItem value="developer-agent">Developer Agent</SelectItem>
                      <SelectItem value="security-agent">Security Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job-cron">Schedule (Cron)</Label>
                  <Select value={newJobCron} onValueChange={setNewJobCron}>
                    <SelectTrigger id="job-cron">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CRON_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job-description">Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Describe this scheduled job..."
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <Button onClick={handleCreateJob} className="w-full">
                  Create Schedule
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
            placeholder="Search scheduled jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Jobs List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4 sm:p-6">
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏰</div>
              <div className="empty-state-title">No scheduled jobs</div>
              <div className="empty-state-description">
                {jobs.length === 0
                  ? "Create your first scheduled job"
                  : "Try adjusting your search"}
              </div>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="card-interactive flex flex-col gap-3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-400 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-50 truncate">
                        {job.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {job.agent} • {formatCronExpression(job.cronExpression)}
                    </p>
                    {job.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`badge-default ${
                      job.isEnabled
                        ? "bg-green-500/10 text-green-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {job.isEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                {/* Timing info */}
                <div className="flex gap-4 text-xs text-slate-400">
                  {job.lastRun && (
                    <div>
                      Last run: {job.lastRun.toLocaleString()}
                    </div>
                  )}
                  {job.nextRun && (
                    <div>
                      Next run: {job.nextRun.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleToggleJob(job.id)}
                  >
                    {job.isEnabled ? (
                      <>
                        <Pause size={14} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
