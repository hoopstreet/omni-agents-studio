import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId?: number;
  taskId?: number;
  domain?: string;
  type: "chat" | "analytics" | "task";
}

export function ExportDialog({
  open,
  onOpenChange,
  chatId,
  taskId,
  domain,
  type,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Export mutations
  const chatCSVMutation = trpc.export.chatHistoryAsCSV.useQuery(
    { chatId: chatId || 0 },
    { enabled: false }
  );

  const chatJSONMutation = trpc.export.chatHistoryAsJSON.useQuery(
    { chatId: chatId || 0 },
    { enabled: false }
  );

  const analyticsCSVMutation = trpc.export.analyticsReportAsCSV.useQuery(
    { domain: domain || "", metrics: [] },
    { enabled: false }
  );

  const taskLogsCSVMutation = trpc.export.taskLogsAsCSV.useQuery(
    { taskId: taskId || 0 },
    { enabled: false }
  );

  const downloadMutation = trpc.export.generateDownloadUrl.useMutation();

  const handleDownload = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      let data;

      if (type === "chat") {
        if (format === "csv") {
          data = await chatCSVMutation.refetch();
        } else {
          data = await chatJSONMutation.refetch();
        }
      } else if (type === "analytics") {
        data = await analyticsCSVMutation.refetch();
      } else if (type === "task") {
        data = await taskLogsCSVMutation.refetch();
      }

      if (!data?.data) {
        toast.error("Failed to export data");
        return;
      }

      const result = await downloadMutation.mutateAsync({
        filename: data.data.filename,
        content: data.data.content,
        mimeType: data.data.mimeType,
      });

      // Create download link
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "chat":
        return "Export Chat History";
      case "analytics":
        return "Export Analytics Report";
      case "task":
        return "Export Task Logs";
      default:
        return "Export Data";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "chat":
        return "Download your chat history in CSV or JSON format";
      case "analytics":
        return "Download analytics report in CSV format";
      case "task":
        return "Download task execution logs in CSV format";
      default:
        return "Export your data";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Export Format</h4>

              <div className="grid grid-cols-2 gap-2">
                {type === "chat" && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleDownload("csv")}
                      disabled={isExporting}
                    >
                      <FileText className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleDownload("json")}
                      disabled={isExporting}
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </Button>
                  </>
                )}

                {(type === "analytics" || type === "task") && (
                  <Button
                    variant="outline"
                    className="gap-2 col-span-2"
                    onClick={() => handleDownload("csv")}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4" />
                    Download as CSV
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                {type === "chat" &&
                  "CSV format is great for spreadsheets. JSON format preserves all metadata."}
                {type === "analytics" &&
                  "Export your analytics data for further analysis in Excel or other tools."}
                {type === "task" &&
                  "Export task logs for debugging and record-keeping."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-2">
            <h4 className="font-medium text-sm">Preview</h4>
            <div className="bg-slate-900 p-3 rounded text-xs text-gray-300 max-h-48 overflow-y-auto font-mono">
              <p>Sample export preview:</p>
              <p className="mt-2 text-gray-500">
                {type === "chat" && "Timestamp,Role,Message\n2026-06-22T...,user,Hello\n2026-06-22T...,assistant,Hi there!"}
                {type === "analytics" && "Metric,Value,Date\nTraffic,10000,2026-06-22T...\nBounce Rate,35%,2026-06-22T..."}
                {type === "task" && "Timestamp,Level,Message\n2026-06-22T...,info,Task started\n2026-06-22T...,info,Processing..."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
