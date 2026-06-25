import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LogOut, Moon, Sun, Bell, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    taskUpdates: true,
    agentAlerts: true,
    scheduleNotifications: true,
    emailDigest: false,
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-50">Settings</h1>
      </div>

      {/* Settings Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-2xl space-y-6 p-4 sm:p-6">
          {/* Account Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">
              Account
            </h2>

            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-50">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </Card>
          </div>

          {/* Appearance Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">
              Appearance
            </h2>

            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon size={18} className="text-blue-400" />
                  ) : (
                    <Sun size={18} className="text-blue-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-50">
                      Theme
                    </p>
                    <p className="text-sm text-slate-400">
                      {theme === "dark" ? "Dark" : "Light"} mode
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </Card>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">
              Notifications
            </h2>

            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-50">
                      Task Updates
                    </p>
                    <p className="text-sm text-slate-400">
                      Get notified when tasks complete
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.taskUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      taskUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-50">
                    Agent Alerts
                  </p>
                  <p className="text-sm text-slate-400">
                    Get notified of agent errors
                  </p>
                </div>
                <Switch
                  checked={notifications.agentAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      agentAlerts: checked,
                    })
                  }
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-50">
                    Schedule Notifications
                  </p>
                  <p className="text-sm text-slate-400">
                    Get notified before scheduled jobs run
                  </p>
                </div>
                <Switch
                  checked={notifications.scheduleNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      scheduleNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-50">
                    Email Digest
                  </p>
                  <p className="text-sm text-slate-400">
                    Weekly summary email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailDigest: checked,
                    })
                  }
                />
              </div>
            </Card>
          </div>

          {/* Security Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-50 mb-4">
              Security
            </h2>

            <Card className="p-4 space-y-4">
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
              >
                <Lock size={16} />
                Change Password
              </Button>

              <div className="h-px bg-border" />

              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
              >
                <Lock size={16} />
                Two-Factor Authentication
              </Button>
            </Card>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-lg font-semibold text-destructive mb-4">
              Danger Zone
            </h2>

            <Card className="p-4 border-destructive/20 bg-destructive/5">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2 justify-start"
                  >
                    <Trash2 size={16} />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      Type your email to confirm:
                    </p>
                    <Button variant="destructive" className="w-full">
                      Delete My Account
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
