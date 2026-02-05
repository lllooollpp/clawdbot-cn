import { loadConfig, writeConfigFile } from "../../config/config.js";
import type { ClawdbotConfig, AgentConfig } from "../../config/config.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateAgentsListParams,
  validateAgentsUpdateParams,
} from "../protocol/index.js";
import { listAgentsForGateway } from "../session-utils.js";
import type { GatewayRequestHandlers } from "./types.js";

export const agentsHandlers: GatewayRequestHandlers = {
  "agents.list": ({ params, respond }) => {
    if (!validateAgentsListParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid agents.list params: ${formatValidationErrors(validateAgentsListParams.errors)}`,
        ),
      );
      return;
    }

    const cfg = loadConfig();
    const result = listAgentsForGateway(cfg);
    respond(true, result, undefined);
  },

  "agents.update": async ({ params, respond }) => {
    if (!validateAgentsUpdateParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid agents.update params: ${formatValidationErrors(validateAgentsUpdateParams.errors)}`,
        ),
      );
      return;
    }

    const p = params as {
      agentId: string;
      name?: string;
      workspace?: string;
      model?: string;
      enabled?: boolean;
    };

    const cfg = loadConfig();
    const agents = cfg.agents ? { ...cfg.agents } : {};
    const list = Array.isArray(agents.list) ? [...agents.list] : [];

    const index = list.findIndex((a) => a.id === p.agentId);

    if (index >= 0) {
      // 更新现有 agent
      const current = { ...list[index] };
      if (p.name !== undefined) current.name = p.name;
      if (p.workspace !== undefined) current.workspace = p.workspace;
      if (p.model !== undefined) current.model = p.model;
      list[index] = current;
    } else {
      // 添加新 agent
      const newAgent: AgentConfig = {
        id: p.agentId,
      };
      if (p.name !== undefined) newAgent.name = p.name;
      if (p.workspace !== undefined) newAgent.workspace = p.workspace;
      if (p.model !== undefined) newAgent.model = p.model;
      list.push(newAgent);
    }

    agents.list = list;
    const nextConfig: ClawdbotConfig = {
      ...cfg,
      agents,
    };

    await writeConfigFile(nextConfig);

    respond(
      true,
      {
        ok: true,
        agentId: p.agentId,
        config: list[index >= 0 ? index : list.length - 1],
      },
      undefined,
    );
  },
};
