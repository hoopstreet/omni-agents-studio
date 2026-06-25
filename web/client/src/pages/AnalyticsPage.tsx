import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, Globe, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  domain: string;
  globalRank: number;
  totalVisits: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgVisitDuration: number;
  pagesPerVisit: number;
  trafficSources: Record<string, number>;
  topCountries: Array<{ country: string; traffic: number; rank: number }>;
  monthlyTrend: Array<{ month: string; visits: number }>;
}

interface TrafficData {
  domain: string;
  trafficSources: Record<string, number>;
  deviceType: string;
}

interface GeoData {
  domain: string;
  topCountries: Array<{ country: string; traffic: number; rank: number }>;
}

interface TrendData {
  domain: string;
  trend: Array<{ month: string; visits: number }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function AnalyticsPage() {
  const [domain, setDomain] = useState("");
  const [compareDomains, setCompareDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Queries
  const analyticsQuery = trpc.analytics?.getDomainAnalytics?.useQuery(
    { domain: selectedDomain || "" },
    { enabled: !!selectedDomain }
  ) as any;

  const compareQuery = trpc.analytics?.compareDomains?.useQuery(
    { domains: compareDomains },
    { enabled: compareDomains.length > 1 }
  ) as any;

  const trafficSourcesQuery = trpc.analytics?.getTrafficSources?.useQuery(
    { domain: selectedDomain || "" },
    { enabled: !!selectedDomain }
  ) as any;

  const geographicQuery = trpc.analytics?.getGeographicData?.useQuery(
    { domain: selectedDomain || "", limit: 10 },
    { enabled: !!selectedDomain }
  ) as any;

  const trendQuery = trpc.analytics?.getMonthlyTrend?.useQuery(
    { domain: selectedDomain || "", months: 12 },
    { enabled: !!selectedDomain }
  ) as any;

  const handleSearch = () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }
    setSelectedDomain(domain.trim());
  };

  const handleAddCompareDomain = () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }
    if (compareDomains.includes(domain.trim())) {
      toast.error("Domain already added");
      return;
    }
    if (compareDomains.length >= 5) {
      toast.error("Maximum 5 domains for comparison");
      return;
    }
    setCompareDomains([...compareDomains, domain.trim()]);
    setDomain("");
  };

  const handleRemoveCompareDomain = (d: string) => {
    setCompareDomains(compareDomains.filter((x) => x !== d));
  };

  const data = analyticsQuery?.data as AnalyticsData | undefined;
  const trafficData = trafficSourcesQuery?.data as TrafficData | undefined;
  const geoData = geographicQuery?.data as GeoData | undefined;
  const trendData = trendQuery?.data as TrendData | undefined;

  return (
    <div className="flex-1 overflow-auto bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-50">Analytics</h1>
        <p className="text-sm text-slate-400">Analyze website traffic and performance metrics</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Search Section */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain (e.g., google.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="bg-slate-800 border-slate-700 text-slate-50"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search size={18} className="mr-2" />
              Analyze
            </Button>
          </div>
        </Card>

        {selectedDomain && (
          <>
            {/* Key Metrics */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Global Rank</p>
                      <p className="text-2xl font-bold text-slate-50">{data.globalRank.toLocaleString()}</p>
                    </div>
                    <Globe size={32} className="text-blue-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Visits</p>
                      <p className="text-2xl font-bold text-slate-50">{(data.totalVisits / 1000000).toFixed(1)}M</p>
                    </div>
                    <Eye size={32} className="text-green-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Bounce Rate</p>
                      <p className="text-2xl font-bold text-slate-50">{data.bounceRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp size={32} className="text-orange-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Avg Duration</p>
                      <p className="text-2xl font-bold text-slate-50">{Math.floor(data.avgVisitDuration)}s</p>
                    </div>
                    <Clock size={32} className="text-purple-400" />
                  </div>
                </Card>
              </div>
            )}

            {/* Charts Section */}
            <Tabs defaultValue="traffic" className="w-full">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
                <TabsTrigger value="geographic">Geographic</TabsTrigger>
                <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>

              {/* Traffic Sources Chart */}
              <TabsContent value="traffic" className="mt-6">
                {trafficData && (
                  <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-slate-50 mb-4">Traffic Sources Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(trafficData.trafficSources).map(([name, value]) => ({
                            name: name.replace(/([A-Z])/g, " $1").trim(),
                            value: Math.max(value, 1), // Ensure non-zero for pie chart
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(trafficData.trafficSources).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </TabsContent>

              {/* Geographic Chart */}
              <TabsContent value="geographic" className="mt-6">
                {geoData && (
                  <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-slate-50 mb-4">Top Countries by Traffic</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={geoData.topCountries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="country" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                        <Bar dataKey="traffic" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </TabsContent>

              {/* Trend Chart */}
              <TabsContent value="trend" className="mt-6">
                {trendData && (
                  <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-slate-50 mb-4">Monthly Visit Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                        <Legend />
                        <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </TabsContent>

              {/* Compare Section */}
              <TabsContent value="compare" className="mt-6 space-y-4">
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-slate-50 mb-4">Compare Domains</h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add domain to compare"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-50"
                    />
                    <Button onClick={handleAddCompareDomain} className="bg-blue-600 hover:bg-blue-700">
                      Add
                    </Button>
                  </div>

                  {compareDomains.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {compareDomains.map((d) => (
                        <div key={d} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                          <span className="text-slate-50">{d}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCompareDomain(d)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {compareQuery.data && (
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={(compareQuery.data as AnalyticsData[] | undefined)?.map((d: AnalyticsData) => ({
                            domain: d.domain,
                            rank: d.globalRank,
                            visits: d.totalVisits / 1000000,
                          })) || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="domain" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                          <Legend />
                          <Bar dataKey="visits" fill="#3b82f6" name="Visits (Millions)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!selectedDomain && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe size={64} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-50 mb-2">No Domain Selected</h3>
            <p className="text-slate-400">Enter a domain above to start analyzing website traffic and performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
