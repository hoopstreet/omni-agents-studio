import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Plus,
  MessageSquare,
  BookOpen,
  Bot,
  CheckSquare,
  Folder,
  Clock,
  Settings,
  Pin,
  Search,
  TrendingUp,
  Terminal,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const mainItems: SidebarItem[] = [
  { id: "chat", label: "New Chat", icon: <MessageSquare size={18} />, href: "/chat" },
  { id: "library", label: "Library", icon: <BookOpen size={18} />, href: "/library" },
  { id: "agents", label: "Agents", icon: <Bot size={18} />, href: "/agents" },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={18} />, href: "/tasks" },
  { id: "projects", label: "Projects", icon: <Folder size={18} />, href: "/projects" },
  { id: "scheduled", label: "Scheduled", icon: <Clock size={18} />, href: "/scheduled" },
  { id: "analytics", label: "Analytics", icon: <TrendingUp size={18} />, href: "/analytics" },
  { id: "marketplace", label: "Marketplace", icon: <ShoppingBag size={18} />, href: "/marketplace" },
  { id: "connectors", label: "Connectors", icon: <Zap size={18} />, href: "/connectors" },
  { id: "openrouter", label: "OpenRouter", icon: <Zap size={18} />, href: "/openrouter" },
  { id: "terminal", label: "Terminal", icon: <Terminal size={18} />, href: "/terminal" },
];

interface SidebarProps {
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
}

export function Sidebar({ onOpenChange, isOpen: externalIsOpen }: SidebarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    setInternalIsOpen(open);
    onOpenChange?.(open);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (href: string) => location === href;

  const filteredItems = mainItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot size={18} className="text-blue-400-foreground" />
            </div>
            <span className="text-sm font-semibold text-slate-50">Omni Agents</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-800 px-4 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 px-3 py-4">
            {/* New Chat */}
            <Link
              href="/chat"
              className={cn(
                "sidebar-item group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-50",
                isActive("/chat") && "active bg-slate-800 text-blue-400"
              )}
            >
              <MessageSquare size={18} />
              <span className="flex-1">✏ New Chat</span>
            </Link>

            {/* Divider */}
            <div className="my-2 h-px bg-border" />

            {/* Main Items */}
            {filteredItems.filter((item) => item.id !== "chat").map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "sidebar-item group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-50",
                  isActive(item.href) && "active bg-slate-800 text-blue-400"
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                    {item.badge}
                  </span>
                )}
                {item.id !== "library" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle add new
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                )}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-2 h-px bg-border" />

            {/* Pinned Section */}
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Pin size={14} />
                <span>Pinned</span>
              </div>
            </div>

            {/* Placeholder for pinned items */}
            <div className="empty-state">
              <div className="text-xs text-slate-400">
                Pin items to quick access
              </div>
            </div>

            {/* Divider */}
            <div className="my-2 h-px bg-border" />

            {/* Recent Chats Section */}
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Clock size={14} />
                <span>Recent Chats</span>
              </div>
            </div>

            {/* Placeholder for recent chats */}
            <div className="empty-state">
              <div className="text-xs text-slate-400">
                No recent chats
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-slate-800 px-3 py-4">
          <Link
            href="/settings"
            className={cn(
              "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-50",
              isActive("/settings") && "active bg-slate-800 text-blue-400"
            )}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
