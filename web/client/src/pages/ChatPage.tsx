import { useState, useRef, useEffect } from "react";
import { Send, Plus, Paperclip, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ExportChatDialog } from "@/components/ExportChatDialog";
import { VoiceInput, TextToSpeech } from "@/components/VoiceInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const MODELS = [
  { id: "auto", label: "Auto" },
  { id: "gpt-5", label: "GPT-5" },
  { id: "claude-sonnet", label: "Claude Sonnet" },
  { id: "gemini-2.5", label: "Gemini 2.5 Pro" },
];

const AGENTS = [
  { id: "launch-desk", label: "Launch Desk" },
  { id: "research", label: "Research Agent" },
  { id: "developer", label: "Developer Agent" },
  { id: "security", label: "Security Agent" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [selectedAgent, setSelectedAgent] = useState("launch-desk");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatTitle, setChatTitle] = useState("New Chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create new chat on mount
  const createChatMutation = trpc.chat.create.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    const createChat = async () => {
      try {
        const agentLabel = AGENTS.find(a => a.id === selectedAgent)?.label || "Agent";
        const title = `Chat with ${agentLabel}`;
        setChatTitle(title);
        
        const chat = await createChatMutation.mutateAsync({
          title,
          model: selectedModel,
          systemPrompt: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
        });
        setCurrentChatId(chat.id);
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to create chat");
      }
    }
    createChat();
  }, [createChatMutation]);

  // Smooth auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Call real LLM API via tRPC
      const response = await sendMessageMutation.mutateAsync({
        chatId: currentChatId,
        content: inputValue,
      });

      // Create assistant message with streaming effect
      const assistantMessage: Message = {
        id: response.id.toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        isStreaming: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue((prev) => (prev ? prev + " " + transcript : transcript));
  };

  const currentMessage = messages.find((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header with Agent and Model Selectors */}
      <div className="border-b border-slate-800 bg-slate-900 p-4 flex gap-4 items-center justify-between">
        <div className="flex-1 flex gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs text-slate-400 block mb-1">Agent</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-slate-700">
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-xs text-slate-400 block mb-1">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-white hover:bg-slate-700">
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
              <ExportChatDialog
                messages={messages}
                chatTitle={chatTitle}
                agent={AGENTS.find(a => a.id === selectedAgent)?.label || "Agent"}
                model={MODELS.find(m => m.id === selectedModel)?.label || "Auto"}
              />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleClearChat}
              className="text-slate-300 hover:bg-slate-700"
            >
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area with Smooth Scrolling */}
      <ScrollArea className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-2">Start a Conversation</h2>
              <p className="text-slate-400 mb-8">
                Chat with {AGENTS.find(a => a.id === selectedAgent)?.label || "your agent"} using {MODELS.find(m => m.id === selectedModel)?.label || "Auto"} model
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                <Button
                  onClick={() => setInputValue("Help me analyze this data")}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Analyze Data
                </Button>
                <Button
                  onClick={() => setInputValue("Create a project plan")}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Project Plan
                </Button>
                <Button
                  onClick={() => setInputValue("Write documentation")}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Documentation
                </Button>
                <Button
                  onClick={() => setInputValue("Debug this code")}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Debug Code
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {message.role === "assistant" ? (
                          <Streamdown>{message.content}</Streamdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-slate-400"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === "assistant" && (
                        <TextToSpeech text={message.content} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-slate-800 text-slate-100 rounded-lg rounded-bl-none p-4 border border-slate-700">
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-slate-400 ml-2">{AGENTS.find(a => a.id === selectedAgent)?.label} is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your agent... or use voice input"
            className="flex-1 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
