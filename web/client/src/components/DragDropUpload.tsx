import { useState, useRef, useCallback } from "react";
import { Upload, X, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface DragDropUploadProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

export function DragDropUpload({
  onFilesSelected,
  acceptedFormats = [".pdf", ".txt", ".docx"],
  maxFileSize = 50, // 50MB default
  multiple = true,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxFileSize}MB limit`,
      };
    }

    // Check file format
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExt)) {
      return {
        valid: false,
        error: `File format not supported. Accepted: ${acceptedFormats.join(", ")}`,
      };
    }

    return { valid: true };
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles: UploadedFile[] = [];
      const validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const validation = validateFile(file);

        if (validation.valid) {
          validFiles.push(file);
          newFiles.push({
            id: Math.random().toString(36),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: "pending",
          });
        } else {
          newFiles.push({
            id: Math.random().toString(36),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: "error",
            error: validation.error,
          });
        }
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles);
        toast.success(`${validFiles.length} file(s) ready to upload`);
      }

      if (newFiles.some((f) => f.status === "error")) {
        toast.error("Some files were rejected");
      }
    },
    [acceptedFormats, maxFileSize, onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500 bg-slate-900/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="font-semibold text-white mb-1">
          Drag and drop your files here
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          or click to browse from your computer
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: {acceptedFormats.join(", ")} • Max size: {maxFileSize}
          MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm text-white">
              {uploadedFiles.length} file(s) selected
            </h4>
            {uploadedFiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-lg border ${
                  file.status === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-gray-600 bg-slate-900/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <File className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>

                      {file.status === "error" && file.error && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {file.error}
                        </div>
                      )}

                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-gray-400 hover:text-gray-300 h-auto p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <Button className="w-full gap-2">
            <Upload className="w-4 h-4" />
            Upload {uploadedFiles.filter((f) => f.status !== "error").length} File
            {uploadedFiles.filter((f) => f.status !== "error").length !== 1
              ? "s"
              : ""}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">
            No files selected yet. Start by dragging files here or clicking the
            upload area.
          </p>
        </div>
      )}
    </div>
  );
}
