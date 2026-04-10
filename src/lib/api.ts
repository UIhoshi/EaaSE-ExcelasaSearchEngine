import type { CachedWorkbook, ProjectConfig } from "../types";

const CONFIG_STORAGE_KEY = "excel-strict-searcher-config-store";

const request = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readConfigStore = (): Record<string, ProjectConfig> => {
  if (!canUseStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, ProjectConfig>;
  } catch {
    return {};
  }
};

const writeConfigStore = (store: Record<string, ProjectConfig>) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(store));
};

export const pickFiles = async (): Promise<string[]> => {
  const payload = await request<{ paths: string[] }>("/api/fs/pick-files", { method: "POST" });
  return payload.paths ?? [];
};

export const pickFolder = async (): Promise<string[]> => {
  const payload = await request<{ paths: string[] }>("/api/fs/pick-folder", { method: "POST" });
  return payload.paths ?? [];
};

export const openWorkbookInExplorer = async (absolutePath: string): Promise<void> => {
  await request<{ ok: boolean }>("/api/fs/open-explorer", {
    method: "POST",
    body: JSON.stringify({ absolutePath }),
  });
};

export const loadWorkbooksFromPaths = async (
  items: Array<{
    absolutePath: string;
    fingerprint?: string;
    headerDepth?: number;
    isFavorite?: boolean;
    importedAt?: number;
  }>,
): Promise<CachedWorkbook[]> => {
  const payload = await request<{ workbooks: CachedWorkbook[] }>("/api/workbooks/load", {
    method: "POST",
    body: JSON.stringify({ items }),
  });

  return payload.workbooks ?? [];
};

export const searchWorkbooksInCache = async (
  query: string,
  fingerprints: string[],
): Promise<{ hits: import("../types").SearchHit[] }> =>
  request<{ hits: import("../types").SearchHit[] }>("/api/search/query", {
    method: "POST",
    body: JSON.stringify({ query, fingerprints }),
  });

export const buildSearchCandidatesInCache = async (
  query: string,
  fingerprints: string[],
  limit = 20,
): Promise<{ candidates: string[] }> =>
  request<{ candidates: string[] }>("/api/search/candidates", {
    method: "POST",
    body: JSON.stringify({ query, fingerprints, limit }),
  });

export const loadConfig = async (fileName: string): Promise<ProjectConfig> => {
  try {
    const payload = await request<{ config: ProjectConfig }>(`/api/config/load?fileName=${encodeURIComponent(fileName)}`);
    return payload.config;
  } catch {
    const store = readConfigStore();
    const config = store[fileName];

    if (!config) {
      throw new Error(`Config "${fileName}" was not found`);
    }

    return config;
  }
};

export const importConfigByDialog = async (): Promise<ProjectConfig | null> => {
  const payload = await request<{ canceled?: boolean; config?: ProjectConfig }>("/api/config/import-dialog", {
    method: "POST",
  });

  return payload.canceled ? null : payload.config ?? null;
};

export const exportConfigByDialog = async (
  config: Pick<ProjectConfig, "fileName" | "configName" | "workbooks" | "preferences">,
): Promise<ProjectConfig | null> => {
  const payload = await request<{ canceled?: boolean; config?: ProjectConfig }>("/api/config/export-dialog", {
    method: "POST",
    body: JSON.stringify(config),
  });

  return payload.canceled ? null : payload.config ?? null;
};

export const saveConfig = async (
  config: Pick<ProjectConfig, "fileName" | "configName" | "workbooks" | "preferences">,
): Promise<ProjectConfig> => {
  try {
    const payload = await request<{ config: ProjectConfig }>("/api/config/save", {
      method: "POST",
      body: JSON.stringify(config),
    });

    return payload.config;
  } catch {
    const nextConfig: ProjectConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };

    const store = readConfigStore();
    store[nextConfig.fileName] = nextConfig;
    writeConfigStore(store);
    return nextConfig;
  }
};

export const sendUiTelemetry = async (event: string, payload: Record<string, unknown>): Promise<void> => {
  try {
    await request<{ ok: boolean }>("/api/telemetry/ui", {
      method: "POST",
      body: JSON.stringify({ event, payload }),
    });
  } catch {
    // Telemetry must never block the main flow.
  }
};
