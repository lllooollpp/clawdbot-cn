import { createSubsystemLogger } from "../logging/subsystem.js";
import {
  registerAgentFilesChangeListener,
  type AgentFilesChangeEvent,
} from "./agent-files-watcher.js";

const log = createSubsystemLogger("agents/broadcast");

export type AgentFilesBroadcast = (
  event: string,
  payload: unknown,
  opts?: { dropIfSlow?: boolean },
) => void;

let broadcastFn: AgentFilesBroadcast | null = null;
let unsubscribe: (() => void) | null = null;

/**
 * Set the broadcast function for agent files changes.
 * This should be called from the gateway server initialization.
 */
export function setAgentFilesBroadcast(broadcast: AgentFilesBroadcast | null): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  broadcastFn = broadcast;

  if (broadcast) {
    unsubscribe = registerAgentFilesChangeListener(handleAgentFilesChange);
    log.info("agent files broadcast enabled");
  } else {
    log.info("agent files broadcast disabled");
  }
}

function handleAgentFilesChange(event: AgentFilesChangeEvent): void {
  if (!broadcastFn) return;

  try {
    broadcastFn(
      "agent.files.changed",
      {
        agentId: event.agentId,
        agentDir: event.agentDir,
        reason: event.reason,
        changedPath: event.changedPath,
        changeType: event.changeType,
        timestamp: Date.now(),
      },
      { dropIfSlow: true },
    );
  } catch (err) {
    log.warn(`failed to broadcast agent files change: ${String(err)}`);
  }
}
