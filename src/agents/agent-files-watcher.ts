import path from "node:path";

import chokidar, { type FSWatcher } from "chokidar";

import { createSubsystemLogger } from "../logging/subsystem.js";

export type AgentFilesChangeEvent = {
  agentId: string;
  agentDir: string;
  reason: "watch" | "manual";
  changedPath?: string;
  changeType?: "add" | "change" | "unlink";
};

type AgentWatchState = {
  watcher: FSWatcher;
  agentDir: string;
  debounceMs: number;
  timer?: ReturnType<typeof setTimeout>;
  pendingChanges: Array<{
    path: string;
    type: "add" | "change" | "unlink";
  }>;
};

const log = createSubsystemLogger("agents/watcher");
const listeners = new Set<(event: AgentFilesChangeEvent) => void>();
const watchers = new Map<string, AgentWatchState>();

export const DEFAULT_AGENT_WATCH_IGNORED: RegExp[] = [
  /(^|[\\/])\.git([\\/]|$)/,
  /(^|[\\/])node_modules([\\/]|$)/,
  /(^|[\\/])dist([\\/]|$)/,
  /(^|[\\/])\.sessions([\\/]|$)/,
  /(^|[\\/])\.registry([\\/]|$)/,
];

function emit(event: AgentFilesChangeEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      log.warn(`agent files change listener failed: ${String(err)}`);
    }
  }
}

/**
 * Register a listener for agent file changes.
 * @returns Unsubscribe function
 */
export function registerAgentFilesChangeListener(listener: (event: AgentFilesChangeEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Manually trigger an agent files change event (e.g., after remote file edit).
 */
export function notifyAgentFilesChanged(params: {
  agentId: string;
  agentDir: string;
  changedPath?: string;
}): void {
  emit({
    agentId: params.agentId,
    agentDir: params.agentDir,
    reason: "manual",
    changedPath: params.changedPath,
  });
}

/**
 * Start watching an agent directory for file changes.
 */
export function startAgentFilesWatcher(params: {
  agentId: string;
  agentDir: string;
  debounceMs?: number;
}): void {
  const { agentId, agentDir, debounceMs = 500 } = params;

  const existing = watchers.get(agentId);
  if (existing && existing.agentDir === agentDir && existing.debounceMs === debounceMs) {
    // Already watching with same config
    return;
  }

  // Stop existing watcher if config changed
  if (existing) {
    stopAgentFilesWatcher(agentId);
  }

  const watcher = chokidar.watch(agentDir, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: debounceMs,
      pollInterval: 100,
    },
    ignored: DEFAULT_AGENT_WATCH_IGNORED,
    persistent: true,
  });

  const state: AgentWatchState = {
    watcher,
    agentDir,
    debounceMs,
    pendingChanges: [],
  };

  const schedule = (changedPath: string, changeType: "add" | "change" | "unlink") => {
    state.pendingChanges.push({ path: changedPath, type: changeType });
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      const changes = state.pendingChanges.slice();
      state.pendingChanges = [];
      state.timer = undefined;

      // Emit event for the most recent change (or aggregate if needed)
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        emit({
          agentId,
          agentDir,
          reason: "watch",
          changedPath: lastChange.path,
          changeType: lastChange.type,
        });
      }
    }, debounceMs);
  };

  watcher.on("add", (p) => schedule(p, "add"));
  watcher.on("change", (p) => schedule(p, "change"));
  watcher.on("unlink", (p) => schedule(p, "unlink"));
  watcher.on("error", (err) => {
    log.warn(`agent files watcher error (${agentId}): ${String(err)}`);
  });

  watchers.set(agentId, state);
  log.info(`watching agent directory: ${agentId} (${agentDir})`);
}

/**
 * Stop watching an agent directory.
 */
export function stopAgentFilesWatcher(agentId: string): void {
  const state = watchers.get(agentId);
  if (!state) return;

  watchers.delete(agentId);
  if (state.timer) clearTimeout(state.timer);
  void state.watcher.close().catch(() => {});
  log.info(`stopped watching agent directory: ${agentId}`);
}

/**
 * Stop all agent file watchers.
 */
export function stopAllAgentFilesWatchers(): void {
  for (const agentId of watchers.keys()) {
    stopAgentFilesWatcher(agentId);
  }
}

/**
 * Get list of currently watched agent IDs.
 */
export function getWatchedAgentIds(): string[] {
  return Array.from(watchers.keys());
}
