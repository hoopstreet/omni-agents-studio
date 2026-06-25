import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, Trash2, Plus } from "lucide-react";

export function ConnectorsPage() {
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const { data: availableConnectors, isLoading: loadingAvailable } =
    trpc.connectorsManagement.listAvailable.useQuery();

  const { data: installedConnectors, isLoading: loadingInstalled } =
    trpc.connectorsManagement.listInstalled.useQuery();

  const authenticateMutation = trpc.connectorsManagement.authenticate.useMutation();
  const testConnectionMutation = trpc.connectorsManagement.testConnection.useMutation();
  const syncMutation = trpc.connectorsManagement.sync.useMutation();
  const disconnectMutation = trpc.connectorsManagement.disconnect.useMutation();

  const handleAuthenticate = async (connectorId: string) => {
    try {
      await authenticateMutation.mutateAsync({
        connectorId,
        credentials,
      });
      setCredentials({});
      setSelectedConnector(null);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleTestConnection = async (connectorId: string) => {
    try {
      await testConnectionMutation.mutateAsync({ connectorId });
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  };

  const handleSync = async (connectorId: string) => {
    try {
      await syncMutation.mutateAsync({ connectorId });
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    try {
      await disconnectMutation.mutateAsync({ connectorId });
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  if (loadingAvailable || loadingInstalled) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Connectors</h1>
        <p className="text-gray-500 mt-2">Manage your integrations and data sources</p>
      </div>

      {/* Installed Connectors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Installed Connectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {installedConnectors?.map((connector) => (
            <Card key={connector.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {connector.name}
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </CardTitle>
                <CardDescription>
                  Last sync: {new Date(connector.lastSync).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(connector.id)}
                    disabled={testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      "Test"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSync(connector.id)}
                    disabled={syncMutation.isPending}
                  >
                    {syncMutation.isPending ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDisconnect(connector.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Connectors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableConnectors?.map((connector) => {
            const isInstalled = installedConnectors?.some((c) => c.id === connector.id);

            return (
              <Card key={connector.id} className={isInstalled ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {connector.name}
                    <Badge variant="outline">{connector.type}</Badge>
                  </CardTitle>
                  <CardDescription>{connector.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isInstalled ? (
                    <Button disabled className="w-full">
                      Installed
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedConnector(connector.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Authentication Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Connect{" "}
                {availableConnectors?.find((c) => c.id === selectedConnector)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="API Key"
                type="password"
                value={credentials.apiKey || ""}
                onChange={(e) =>
                  setCredentials({ ...credentials, apiKey: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConnector(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAuthenticate(selectedConnector)}
                  disabled={authenticateMutation.isPending}
                  className="flex-1"
                >
                  {authenticateMutation.isPending ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
