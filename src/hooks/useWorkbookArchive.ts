import { useEffect, useRef, useState } from "react";
import { exportConfigByDialog, importConfigByDialog, loadConfig, saveConfig } from "../lib/api";
import { getAllCachedWorkbooks } from "../lib/indexedDb";
import { buildWorkbookCachePayload, cloneWorkbookForConfig, isWorkbookCacheSnapshot } from "../lib/workbookCache";
import { resolveInitialLanguage } from "../lib/i18n";
import type { AppLanguage, CachedWorkbook, ConfigWorkbookRecord, ProjectConfig, ToastState } from "../types";

const AUTOSAVE_FILE_NAME = "__autosave";

type UseWorkbookArchiveParams = {
  language: AppLanguage;
  layoutMode: "standard" | "expanded";
  setLanguage: (language: AppLanguage) => void;
  setLayoutMode: (layoutMode: "standard" | "expanded") => void;
  workbooks: CachedWorkbook[];
  setWorkbooks: (updater: CachedWorkbook[] | ((current: CachedWorkbook[]) => CachedWorkbook[])) => void;
  resetHeaderState: () => void;
  setToast: (toast: ToastState | null) => void;
  t: {
    configLoaded: string;
    configSaved: string;
    configSaveFailed: string;
    configLoadFailed: string;
  };
};

export const useWorkbookArchive = ({
  language,
  layoutMode,
  setLanguage,
  setLayoutMode,
  workbooks,
  setWorkbooks,
  resetHeaderState,
  setToast,
  t,
}: UseWorkbookArchiveParams) => {
  const [loading, setLoading] = useState(true);
  const [activeArchive, setActiveArchive] = useState("");
  const autosaveReadyRef = useRef(false);

  const persistDefaultCache = async (
    nextWorkbooks: CachedWorkbook[],
    nextLayoutMode: "standard" | "expanded",
    nextLanguage: AppLanguage,
  ) => {
    await saveConfig({
      fileName: AUTOSAVE_FILE_NAME,
      configName: "Auto Save",
      workbooks: buildWorkbookCachePayload(nextWorkbooks),
      preferences: {
        layout: nextLayoutMode,
        theme: "light",
        language: nextLanguage,
      },
    });
  };

  const applyConfig = async (
    config: ProjectConfig,
    options?: { silent?: boolean; archiveName?: string },
  ) => {
    const cachedSnapshots = config.workbooks.filter(isWorkbookCacheSnapshot).map((workbook) => cloneWorkbookForConfig(workbook));
    const workbookRecords = config.workbooks.filter(
      (workbook): workbook is ConfigWorkbookRecord => !isWorkbookCacheSnapshot(workbook),
    );
    const restoredWorkbooks = workbookRecords.length > 0 ? await getAllCachedWorkbooks(workbookRecords) : [];
    const nextWorkbooks = [...cachedSnapshots, ...restoredWorkbooks];

    nextWorkbooks.sort((a, b) => b.importedAt - a.importedAt);
    setWorkbooks(nextWorkbooks);
    setLayoutMode(config.preferences.layout ?? "standard");
    setLanguage(config.preferences.language ?? resolveInitialLanguage());
    resetHeaderState();
    setActiveArchive(options?.archiveName ?? (config.fileName === AUTOSAVE_FILE_NAME ? "" : config.configName || config.fileName));
    await persistDefaultCache(
      nextWorkbooks,
      config.preferences.layout ?? "standard",
      config.preferences.language ?? resolveInitialLanguage(),
    );

    if (!options?.silent) {
      setToast({
        id: Date.now(),
        message: t.configLoaded,
        x: 24,
        y: 24,
      });
    }
  };

  const loadArchiveByFileName = async (fileName: string, options?: { silent?: boolean }) => {
    const config = await loadConfig(fileName);
    await applyConfig(config, options);
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadArchiveByFileName(AUTOSAVE_FILE_NAME, { silent: true });
      } catch {
        setWorkbooks([]);
      } finally {
        autosaveReadyRef.current = true;
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!autosaveReadyRef.current || loading) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void saveConfig({
        fileName: AUTOSAVE_FILE_NAME,
        configName: "Auto Save",
        workbooks: buildWorkbookCachePayload(workbooks),
        preferences: {
          layout: layoutMode,
          theme: "light",
          language,
        },
      }).catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [language, layoutMode, loading, workbooks]);

  const handleSaveConfig = async () => {
    try {
      const config = await exportConfigByDialog({
        fileName: activeArchive || "project-archive",
        configName: activeArchive || "Project Archive",
        workbooks: buildWorkbookCachePayload(workbooks),
        preferences: {
          layout: layoutMode,
          theme: "light",
          language,
        },
      });

      if (!config) {
        return;
      }

      setActiveArchive(config.configName || config.fileName);
      await persistDefaultCache(workbooks, layoutMode, language);
      setToast({
        id: Date.now(),
        message: t.configSaved,
        x: 24,
        y: 24,
      });
    } catch {
      window.alert(t.configSaveFailed);
    }
  };

  const handleLoadConfig = async () => {
    try {
      const config = await importConfigByDialog();
      if (!config) {
        return;
      }

      setLoading(true);
      await applyConfig(config, {
        archiveName: config.configName || config.fileName,
      });
    } catch {
      window.alert(t.configLoadFailed);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeArchive,
    handleLoadConfig,
    handleSaveConfig,
    loading,
    setActiveArchive,
  };
};
