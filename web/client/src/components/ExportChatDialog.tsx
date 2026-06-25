import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ExportChatDialogProps {
  messages: Message[];
  chatTitle: string;
  agent: string;
  model: string;
}

export function ExportChatDialog({
  messages,
  chatTitle,
  agent,
  model,
}: ExportChatDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsCSV = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["Timestamp", "Role", "Content"];
      const rows = messages.map((msg) => [
        msg.timestamp.toISOString(),
        msg.role,
        `"${msg.content.replace(/"/g, '""')}"`,
      ]);

      const csv = [
        `Chat: ${chatTitle}`,
        `Agent: ${agent}`,
        `Model: ${model}`,
        `Exported: ${new Date().toISOString()}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Chat exported as CSV");
    } catch (error) {
      toast.error("Failed to export chat");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    setIsExporting(true);
    try {
      // Create a simple HTML representation
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${chatTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .metadata { color: #666; font-size: 12px; margin: 5px 0; }
            .message { margin: 15px 0; padding: 10px; border-radius: 5px; }
            .user { background-color: #e3f2fd; text-align: right; }
            .assistant { background-color: #f5f5f5; }
            .timestamp { font-size: 11px; color: #999; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${chatTitle}</h1>
            <div class="metadata">Agent: ${agent}</div>
            <div class="metadata">Model: ${model}</div>
            <div class="metadata">Exported: ${new Date().toLocaleString()}</div>
          </div>
          <div class="messages">
            ${messages
              .map(
                (msg) => `
              <div class="message ${msg.role}">
                <strong>${msg.role === "user" ? "You" : agent}:</strong>
                <p>${msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                <div class="timestamp">${msg.timestamp.toLocaleString()}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
        </html>
      `;

      // For now, create a downloadable HTML file
      // In production, you'd use a library like jsPDF or html2pdf
      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Chat exported as HTML (PDF-ready)");
    } catch (error) {
      toast.error("Failed to export chat");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Export Chat</DialogTitle>
          <DialogDescription className="text-slate-400">
            Download your chat history in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={exportAsCSV}
            disabled={isExporting || messages.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
          >
            <Table className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>

          <Button
            onClick={exportAsPDF}
            disabled={isExporting || messages.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as HTML/PDF
          </Button>

          <p className="text-xs text-slate-500 text-center">
            {messages.length} messages will be exported
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
