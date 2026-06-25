import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "suggestion";
  content: string;
  timestamp: Date;
}

export default function TerminalPage() {
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleExecuteCommand = async () => {
    if (!command.trim()) {
      toast.error("Please enter a command");
      return;
    }

    setIsExecuting(true);
    const commandId = `cmd-${Date.now()}`;

    // Add command to terminal
    setLines((prev) => [
      ...prev,
      {
        id: commandId,
        type: "input",
        content: `$ ${command}`,
        timestamp: new Date(),
      },
    ]);

    try {
      // Simulate command execution
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add mock output
      setLines((prev) => [
        ...prev,
        {
          id: `output-${commandId}`,
          type: "output",
          content: `Command executed successfully: ${command}`,
          timestamp: new Date(),
        },
      ]);

      // Show recommendations
      const mockRecs = [
        "Run tests with: pnpm test",
        "Build project with: pnpm build",
        "Deploy with: pnpm deploy",
      ];
      setRecommendations(mockRecs);
      setShowRecommendations(true);

      setCommand("");
    } catch (error) {
      toast.error("Failed to execute command");
      setLines((prev) => [
        ...prev,
        {
          id: `error-${commandId}`,
          type: "error",
          content: error instanceof Error ? error.message : "Command execution failed",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApplyRecommendation = (rec: string) => {
    setCommand(rec);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
          <Terminal size={24} />
          Terminal Agent
        </h1>
        <p className="text-sm text-slate-400">AI-powered terminal with error fixing and recommendations</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900 border-slate-800 p-4">
              <div className="space-y-4">
                {/* Terminal Output */}
                <ScrollArea className="h-96 bg-slate-950 rounded-lg border border-slate-800 p-4" ref={scrollRef}>
                  <div className="font-mono text-sm space-y-2">
                    {lines.length === 0 ? (
                      <div className="text-slate-500">
                        <p>Welcome to Terminal Agent</p>
                        <p className="text-xs mt-2">Enter a command to get started...</p>
                      </div>
                    ) : (
                      lines.map((line) => (
                        <div
                          key={line.id}
                          className={`${
                            line.type === "input"
                              ? "text-green-400"
                              : line.type === "error"
                              ? "text-red-400"
                              : line.type === "suggestion"
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }`}
                        >
                          {line.content}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Command Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter command..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleExecuteCommand()}
                    disabled={isExecuting}
                    className="bg-slate-800 border-slate-700 text-slate-50 font-mono"
                  />
                  <Button
                    onClick={handleExecuteCommand}
                    disabled={isExecuting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Context Info */}
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-50 mb-3">Terminal Context</h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-300">Shell:</span> /bin/bash
                </div>
                <div>
                  <span className="text-slate-300">User:</span> ubuntu
                </div>
                <div>
                  <span className="text-slate-300">Host:</span> sandbox
                </div>
                <div>
                  <span className="text-slate-300">Dir:</span> /home/ubuntu
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            {showRecommendations && recommendations.length > 0 && (
              <Card className="bg-slate-900 border-slate-800 p-4">
                <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
                  <Lightbulb size={16} className="text-yellow-400" />
                  Next Steps
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplyRecommendation(rec)}
                      className="w-full justify-start text-xs text-left h-auto py-2 px-2 text-slate-300 hover:text-slate-50 hover:bg-slate-800"
                    >
                      <span className="line-clamp-2">{rec}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-50 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommand("npm run dev")}
                  className="w-full justify-start"
                >
                  npm run dev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommand("git status")}
                  className="w-full justify-start"
                >
                  git status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommand("pnpm test")}
                  className="w-full justify-start"
                >
                  pnpm test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLines([])}
                  className="w-full justify-start text-red-400 hover:text-red-300"
                >
                  Clear Terminal
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
