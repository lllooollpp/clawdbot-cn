import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClawdbotConfig } from "../../config/types.js";
import { createSessionsSpawnTool } from "./sessions-spawn-tool.js";

vi.mock("../../config/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../config/config.js")>();
  return {
    ...actual,
    loadConfig: vi.fn(),
  };
});

vi.mock("../../gateway/call.js", () => ({
  callGateway: vi.fn(),
}));

vi.mock("../subagent-registry.js", () => ({
  registerSubagentRun: vi.fn(),
}));

describe("sessions_spawn thinking configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses global default thinking level when no override is provided", async () => {
    const { loadConfig } = await import("../../config/config.js");
    const { callGateway } = await import("../../gateway/call.js");

    const mockConfig: Partial<ClawdbotConfig> = {
      agents: {
        defaults: {
          subagents: {
            thinking: "medium",
          },
        },
        list: [{ id: "test-agent" }],
      },
    };

    vi.mocked(loadConfig).mockReturnValue(mockConfig as ClawdbotConfig);
    vi.mocked(callGateway).mockResolvedValue({ runId: "test-run-id" });

    const tool = createSessionsSpawnTool({
      agentSessionKey: "agent:test-agent:main",
    });

    await tool.execute("call-id", { task: "test task" });

    expect(callGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "agent",
        params: expect.objectContaining({
          thinking: "medium",
        }),
      }),
    );
  });

  it("uses per-agent thinking level over global default", async () => {
    const { loadConfig } = await import("../../config/config.js");
    const { callGateway } = await import("../../gateway/call.js");

    const mockConfig: Partial<ClawdbotConfig> = {
      agents: {
        defaults: {
          subagents: {
            thinking: "low",
          },
        },
        list: [
          {
            id: "test-agent",
            subagents: {
              thinking: "high",
            },
          },
        ],
      },
    };

    vi.mocked(loadConfig).mockReturnValue(mockConfig as ClawdbotConfig);
    vi.mocked(callGateway).mockResolvedValue({ runId: "test-run-id" });

    const tool = createSessionsSpawnTool({
      agentSessionKey: "agent:test-agent:main",
    });

    await tool.execute("call-id", { task: "test task" });

    expect(callGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "agent",
        params: expect.objectContaining({
          thinking: "high",
        }),
      }),
    );
  });

  it("uses explicit thinking parameter over all defaults", async () => {
    const { loadConfig } = await import("../../config/config.js");
    const { callGateway } = await import("../../gateway/call.js");

    const mockConfig: Partial<ClawdbotConfig> = {
      agents: {
        defaults: {
          subagents: {
            thinking: "low",
          },
        },
        list: [
          {
            id: "test-agent",
            subagents: {
              thinking: "medium",
            },
          },
        ],
      },
    };

    vi.mocked(loadConfig).mockReturnValue(mockConfig as ClawdbotConfig);
    vi.mocked(callGateway).mockResolvedValue({ runId: "test-run-id" });

    const tool = createSessionsSpawnTool({
      agentSessionKey: "agent:test-agent:main",
    });

    await tool.execute("call-id", { task: "test task", thinking: "xhigh" });

    expect(callGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "agent",
        params: expect.objectContaining({
          thinking: "xhigh",
        }),
      }),
    );
  });

  it("does not set thinking when no defaults are configured", async () => {
    const { loadConfig } = await import("../../config/config.js");
    const { callGateway } = await import("../../gateway/call.js");

    const mockConfig: Partial<ClawdbotConfig> = {
      agents: {
        list: [{ id: "test-agent" }],
      },
    };

    vi.mocked(loadConfig).mockReturnValue(mockConfig as ClawdbotConfig);
    vi.mocked(callGateway).mockResolvedValue({ runId: "test-run-id" });

    const tool = createSessionsSpawnTool({
      agentSessionKey: "agent:test-agent:main",
    });

    await tool.execute("call-id", { task: "test task" });

    expect(callGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "agent",
        params: expect.objectContaining({
          thinking: undefined,
        }),
      }),
    );
  });
});
