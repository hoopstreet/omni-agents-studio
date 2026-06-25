import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Zap, Users, Workflow, BarChart3 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-950 to-blue-900/20 px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="space-y-2">
            <div className="text-5xl">🤖</div>
            <h1 className="text-3xl font-bold text-slate-50">Omni-Agents Studio</h1>
            <p className="text-slate-400">
              Your unified AI workspace for chat, agents, tasks, and automation
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              Sign in to get started with your AI productivity platform
            </p>
            <Button asChild size="lg" className="w-full gap-2">
              <a href={`${import.meta.env.VITE_OAUTH_PORTAL_URL}`}>
                Sign In
                <ArrowRight size={18} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-6 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-50">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-slate-400">
            Your AI workspace is ready. Start by creating a chat or running an agent.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-6xl space-y-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">Quick Start</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/chat">
                <a className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:shadow-md hover:bg-slate-800/80">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-slate-50">New Chat</h3>
                    <p className="text-sm text-slate-400">Start a conversation</p>
                  </div>
                </a>
              </Link>

              <Link href="/agents">
                <a className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:shadow-md hover:bg-slate-800/80">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold text-slate-50">Create Agent</h3>
                    <p className="text-sm text-slate-400">Build an AI agent</p>
                  </div>
                </a>
              </Link>

              <Link href="/projects">
                <a className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:shadow-md hover:bg-slate-800/80">
                  <div className="text-2xl">📂</div>
                  <div>
                    <h3 className="font-semibold text-slate-50">New Project</h3>
                    <p className="text-sm text-slate-400">Organize your work</p>
                  </div>
                </a>
              </Link>

              <Link href="/scheduled">
                <a className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:shadow-md hover:bg-slate-800/80">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h3 className="font-semibold text-slate-50">Schedule Job</h3>
                    <p className="text-sm text-slate-400">Automate tasks</p>
                  </div>
                </a>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">Features</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4 flex gap-3">
                <Zap size={24} className="text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-50">AI Chat</h3>
                  <p className="text-sm text-slate-400">
                    Multi-turn conversations with streaming responses
                  </p>
                </div>
              </Card>

              <Card className="p-4 flex gap-3">
                <Users size={24} className="text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-50">Agents</h3>
                  <p className="text-sm text-slate-400">
                    Create and manage autonomous AI agents
                  </p>
                </div>
              </Card>

              <Card className="p-4 flex gap-3">
                <Workflow size={24} className="text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-50">Automation</h3>
                  <p className="text-sm text-slate-400">
                    Schedule recurring agent tasks with cron
                  </p>
                </div>
              </Card>

              <Card className="p-4 flex gap-3">
                <BarChart3 size={24} className="text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-50">Analytics</h3>
                  <p className="text-sm text-slate-400">
                    Track tasks, agents, and project progress
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
