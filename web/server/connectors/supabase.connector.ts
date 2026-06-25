import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class SupabaseConnector extends APIKeyConnector {
  private projectUrl: string = "";
  private baseUrl: string = "";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "supabase",
      name: "Supabase",
      type: "development",
      description: "Supabase - PostgreSQL database and backend",
      authType: "api_key",
      requiredFields: ["apiKey", "projectUrl"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/`, {
        headers: {
          apikey: this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/information_schema.tables?limit=100`, {
        headers: {
          apikey: this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync tables");
      }

      const tables = (await response.json()) as any[];

      return {
        success: true,
        itemsSynced: tables.length,
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: (error as Error).message,
      };
    }
  }

  getCapabilities(): string[] {
    return ["query_table", "insert_data", "update_data", "delete_data", "list_tables"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "query_table":
        return this.queryTable(params.tableName, params.filters);
      case "insert_data":
        return this.insertData(params.tableName, params.data);
      case "update_data":
        return this.updateData(params.tableName, params.id, params.data);
      case "delete_data":
        return this.deleteData(params.tableName, params.id);
      case "list_tables":
        return this.listTables();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async queryTable(tableName: string, filters?: Record<string, any>): Promise<any> {
    let url = `${this.baseUrl}/rest/v1/${tableName}`;

    if (filters) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        params.append(key, `eq.${value}`);
      }
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        apikey: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to query table");
    }

    return response.json();
  }

  private async insertData(tableName: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rest/v1/${tableName}`, {
      method: "POST",
      headers: {
        apikey: this.apiKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to insert data");
    }

    return response.json();
  }

  private async updateData(
    tableName: string,
    id: string,
    data: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rest/v1/${tableName}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: this.apiKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update data");
    }

    return response.json();
  }

  private async deleteData(tableName: string, id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rest/v1/${tableName}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: this.apiKey,
      },
    });

    return response.ok;
  }

  private async listTables(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/rest/v1/information_schema.tables?table_schema=eq.public`,
      {
        headers: {
          apikey: this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to list tables");
    }

    return response.json();
  }
}
