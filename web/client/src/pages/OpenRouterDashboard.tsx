import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, BarChart3, Lock, Zap, TrendingDown, DollarSign } from "lucide-react";

interface CostData {
  daily: number;
  monthly: number;
  dailyLimit: number;
  monthlyLimit: number;
  lastUpdated: string;
}

interface ModelStats {
  model: string;
  tier: "free" | "mid" | "premium";
  usage: number;
  cost: number;
  successRate: number;
}

interface SecurityStatus {
  promptInjectionProtection: boolean;
  sensitiveDataDetection: boolean;
  zeroDataRetention: boolean;
  lastAuditLog: string;
}

export default function OpenRouterDashboard() {
  const [costData, setCostData] = useState<CostData>({
    daily: 12.5,
    monthly: 245.8,
    dailyLimit: 50,
    monthlyLimit: 1000,
    lastUpdated: new Date().toISOString(),
  });

  const [modelStats, setModelStats] = useState<ModelStats[]>([
    { model: "Gemini 2.5 Flash", tier: "free", usage: 450, cost: 0, successRate: 98.5 },
    { model: "Claude 3.5 Sonnet", tier: "mid", usage: 120, cost: 45.2, successRate: 99.2 },
    { model: "GPT-4o", tier: "mid", usage: 85, cost: 32.1, successRate: 99.1 },
    { model: "Llama 3.1 8B", tier: "free", usage: 200, cost: 0, successRate: 96.8 },
  ]);

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    promptInjectionProtection: true,
    sensitiveDataDetection: true,
    zeroDataRetention: true,
    lastAuditLog: "2 hours ago",
  });

  const dailyUsagePercent = (costData.daily / costData.dailyLimit) * 100;
  const monthlyUsagePercent = (costData.monthly / costData.monthlyLimit) * 100;
  const isLowBalance = costData.monthly > costData.monthlyLimit * 0.8;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OpenRouter Admin Dashboard</h1>
          <p className="text-slate-400">Monitor costs, model performance, and security in real-time</p>
        </div>

        {/* Alert Banner */}
        {isLowBalance && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Monthly spending is at {monthlyUsagePercent.toFixed(1)}% of your budget limit. Consider reviewing your model routing strategy.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Daily Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${costData.daily.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">of ${costData.dailyLimit}/day</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Monthly Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${costData.monthly.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">of ${costData.monthlyLimit}/month</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${monthlyUsagePercent > 80 ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(monthlyUsagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">855</div>
              <p className="text-xs text-slate-400 mt-1">this month</p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">98% Success</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">All Systems Active</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Last audit: {securityStatus.lastAuditLog}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="models" className="text-slate-300">Model Routing</TabsTrigger>
            <TabsTrigger value="costs" className="text-slate-300">Cost Analytics</TabsTrigger>
            <TabsTrigger value="security" className="text-slate-300">Security</TabsTrigger>
            <TabsTrigger value="settings" className="text-slate-300">Settings</TabsTrigger>
          </TabsList>

          {/* Model Routing Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Model Performance & Usage</CardTitle>
                <CardDescription className="text-slate-400">Real-time statistics for each model tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelStats.map((stat) => (
                    <div key={stat.model} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{stat.model}</span>
                          <Badge variant={stat.tier === "free" ? "default" : stat.tier === "mid" ? "secondary" : "destructive"}>
                            {stat.tier.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {stat.usage} requests • Success rate: {stat.successRate}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">${stat.cost.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">this month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Routing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-sm font-medium text-white mb-1">Current Mode: Balanced</p>
                  <p className="text-xs text-slate-400">Cost/Quality Balance: 5/10 (Recommended)</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Adjust Routing Strategy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analytics Tab */}
          <TabsContent value="costs" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Cost Breakdown
                </CardTitle>
                <CardDescription className="text-slate-400">Spending distribution by model tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Tier 1 (Free Models)</span>
                    <span className="text-white font-bold">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Tier 2 (Mid-Tier)</span>
                    <span className="text-white font-bold">$77.30</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Tier 3 (Premium)</span>
                    <span className="text-white font-bold">$0.00</span>
                  </div>
                  <div className="border-t border-slate-600 pt-4 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Total This Month</span>
                    <span className="text-white font-bold text-lg">${costData.monthly.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span>70% of requests using free models (Tier 1) - Excellent!</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-500">⚠</span>
                    <span>Consider batching requests to reduce token overhead by ~15%</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">→</span>
                    <span>Implement caching for frequently asked questions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  Security Status
                </CardTitle>
                <CardDescription className="text-slate-400">All security features active and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Prompt Injection Protection</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Sensitive Data Detection</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Zero Data Retention (ZDR)</span>
                  <Badge className="bg-green-600">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="p-2 bg-slate-700 rounded">
                    <p className="font-medium">No threats detected</p>
                    <p className="text-xs text-slate-400">All systems operating normally</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Budget Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Daily Limit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue="50"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <span className="text-slate-400 py-2">USD</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Monthly Limit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue="1000"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                    <span className="text-slate-400 py-2">USD</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Model Tier Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  Manage Allowed Models
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
