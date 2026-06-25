import { useState, useRef, useEffect } from "react";
import { Plus, Search, Trash2, Eye, FileText, Upload, FolderOpen, Zap, Tag } from "lucide-react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface KnowledgeDoc {
  id: string;
  title: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  summary?: string;
  tags: string[];
  vectorized?: boolean;
  indexed?: boolean;
  embeddings?: number;
}

const SAMPLE_DOCS: KnowledgeDoc[] = [
  {
    id: "1",
    title: "Product Roadmap Q1 2026",
    fileType: "PDF",
    fileSize: 2.5,
    uploadedAt: new Date(Date.now() - 86400000 * 3),
    summary: "Strategic product roadmap for Q1 2026",
    tags: ["strategy", "product"],
    vectorized: true,
    indexed: true,
    embeddings: 1024,
  },
  {
    id: "2",
    title: "API Documentation",
    fileType: "DOCX",
    fileSize: 1.8,
    uploadedAt: new Date(Date.now() - 86400000 * 7),
    summary: "Complete API reference and integration guide",
    tags: ["api", "documentation"],
    vectorized: true,
    indexed: true,
    embeddings: 2048,
  },
  {
    id: "3",
    title: "Market Analysis Report",
    fileType: "PDF",
    fileSize: 4.2,
    uploadedAt: new Date(Date.now() - 86400000 * 14),
    summary: "Competitive market analysis and trends",
    tags: ["market", "analysis"],
    vectorized: false,
    indexed: false,
  },
];

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(SAMPLE_DOCS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocSummary, setNewDocSummary] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      !selectedTag || doc.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(
    new Set(docs.flatMap((doc) => doc.tags))
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setIsUploadDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setIsUploadDialogOpen(true);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setIsUploadDialogOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
      setNewTags([...newTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate batch upload with progress
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create new document
        const newDoc: KnowledgeDoc = {
          id: Date.now().toString() + i,
          title: newDocTitle || file.name,
          fileType: file.name.split('.').pop()?.toUpperCase() || "FILE",
          fileSize: file.size / (1024 * 1024),
          uploadedAt: new Date(),
          summary: newDocSummary || `Uploaded document: ${file.name}`,
          tags: newTags.length > 0 ? newTags : ["uploaded"],
          vectorized: false,
          indexed: false,
        };

        setDocs(prev => [...prev, newDoc]);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));

        // Simulate vectorization
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setDocs(prev => 
          prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, vectorized: true, indexed: true, embeddings: Math.floor(Math.random() * 2048) + 512 }
              : doc
          )
        );
      }

      toast.success(`Successfully uploaded and indexed ${selectedFiles.length} document(s)`);
      setIsUploadDialogOpen(false);
      setSelectedFiles([]);
      setNewDocTitle("");
      setNewDocSummary("");
      setNewTags([]);
      setUploadProgress(0);
    } catch (error) {
      toast.error("Failed to upload documents");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocs(docs.filter(doc => doc.id !== id));
    toast.success("Document deleted");
  };

  const handleVectorizeDoc = async (id: string) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDocs(prev =>
        prev.map(doc =>
          doc.id === id
            ? { ...doc, vectorized: true, indexed: true, embeddings: Math.floor(Math.random() * 2048) + 512 }
            : doc
        )
      );
      toast.success("Document vectorized and indexed");
    } catch (error) {
      toast.error("Failed to vectorize document");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
          <div className="flex gap-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Upload documents to your knowledge base. Supports PDF, DOCX, and TXT files.
                  </DialogDescription>
                </DialogHeader>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                  }`}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-white font-medium">Drag and drop files here</p>
                  <p className="text-slate-400 text-sm">or click to browse</p>
                  <p className="text-slate-500 text-xs mt-2">Supports PDF, DOCX, TXT (Max 50MB per file)</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Folder Upload */}
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Upload Folder
                </Button>

                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                  {...({ webkitdirectory: true } as any)}
                />

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Selected Files ({selectedFiles.length})</Label>
                    <div className="bg-slate-800 rounded p-3 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="text-sm text-slate-400 py-1">
                          📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-300">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="Document title"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="summary" className="text-slate-300">Summary (Optional)</Label>
                    <Textarea
                      id="summary"
                      value={newDocSummary}
                      onChange={(e) => setNewDocSummary(e.target.value)}
                      placeholder="Document summary"
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Add tag and press Enter"
                        className="bg-slate-800 border-slate-700 text-white flex-1"
                      />
                      <Button
                        onClick={handleAddTag}
                        variant="outline"
                        className="border-slate-700 text-slate-300"
                      >
                        Add
                      </Button>
                    </div>
                    {newTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newTags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-blue-600/20 text-blue-300 cursor-pointer hover:bg-blue-600/30"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Processing...</span>
                      <span className="text-blue-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUploadDocuments}
                  disabled={selectedFiles.length === 0 || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? "Processing..." : "Upload & Index"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null ? "bg-blue-600" : "border-slate-700"}
            >
              All
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-blue-600" : "border-slate-700 text-slate-300"}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <ScrollArea className="flex-1 p-6">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <FileText className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No documents found</h2>
            <p className="text-slate-500">Upload documents to build your knowledge base</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <Card key={doc.id} className="bg-slate-800 border-slate-700 p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white truncate">{doc.title}</h3>
                      <p className="text-xs text-slate-400">{doc.fileType} • {doc.fileSize.toFixed(1)} MB</p>
                    </div>
                  </div>
                </div>

                {doc.summary && (
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{doc.summary}</p>
                )}

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Vectorization Status */}
                <div className="flex items-center gap-2 mb-3 text-xs">
                  {doc.vectorized ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <Zap className="w-3 h-3" />
                      Vectorized ({doc.embeddings} dims)
                    </div>
                  ) : (
                    <div className="text-slate-500">Not vectorized</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {!doc.vectorized && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-700"
                      onClick={() => handleVectorizeDoc(doc.id)}
                      disabled={isProcessing}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Index
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDeleteDoc(doc.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Uploaded {doc.uploadedAt.toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
