import { describe, it, expect, vi } from "vitest";
import { wrapToolWithAbortSignal } from "./pi-tools.abort.js";
import type { AnyAgentTool } from "./pi-tools.types.js";

describe("pi-tools.abort", () => {
  describe("wrapToolWithAbortSignal", () => {
    it("returns original tool when no abortSignal provided", () => {
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: vi.fn(),
      };
      const wrapped = wrapToolWithAbortSignal(tool);
      expect(wrapped).toBe(tool);
    });

    it("returns original tool when tool has no execute function", () => {
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
      };
      const abortController = new AbortController();
      const wrapped = wrapToolWithAbortSignal(tool, abortController.signal);
      expect(wrapped).toBe(tool);
    });

    it("combines abort signals correctly with valid AbortSignal instances", async () => {
      const executeMock = vi.fn().mockResolvedValue({ result: "success" });
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: executeMock,
      };

      const toolAbortController = new AbortController();
      const externalAbortController = new AbortController();

      const wrapped = wrapToolWithAbortSignal(tool, externalAbortController.signal);

      await wrapped.execute!("call-1", {}, toolAbortController.signal, undefined);

      expect(executeMock).toHaveBeenCalledTimes(1);
      const callArgs = executeMock.mock.calls[0];
      expect(callArgs[0]).toBe("call-1");
      expect(callArgs[2]).toBeInstanceOf(AbortSignal);
    });

    it("throws AbortError when external signal is already aborted", async () => {
      const executeMock = vi.fn();
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: executeMock,
      };

      const abortController = new AbortController();
      abortController.abort();

      const wrapped = wrapToolWithAbortSignal(tool, abortController.signal);

      await expect(wrapped.execute!("call-1", {}, undefined, undefined)).rejects.toThrow("Aborted");
      expect(executeMock).not.toHaveBeenCalled();
    });

    it("aborts when external signal is aborted during execution", async () => {
      const abortController = new AbortController();
      let capturedSignal: AbortSignal | undefined;

      const executeMock = vi.fn().mockImplementation(async (_id, _params, signal) => {
        capturedSignal = signal;
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { result: "success" };
      });

      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: executeMock,
      };

      const wrapped = wrapToolWithAbortSignal(tool, abortController.signal);

      const executePromise = wrapped.execute!("call-1", {}, undefined, undefined);

      // Abort after execution starts
      setTimeout(() => abortController.abort(), 5);

      await executePromise;

      expect(capturedSignal).toBeInstanceOf(AbortSignal);
      expect(capturedSignal?.aborted).toBe(true);
    });

    it("handles non-AbortSignal objects gracefully", async () => {
      const executeMock = vi.fn().mockResolvedValue({ result: "success" });
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: executeMock,
      };

      // Create a fake signal object that's not an AbortSignal instance
      const fakeSignal = {
        aborted: false,
        addEventListener: vi.fn(),
      } as unknown as AbortSignal;

      const wrapped = wrapToolWithAbortSignal(tool, fakeSignal);

      await wrapped.execute!("call-1", {}, undefined, undefined);

      expect(executeMock).toHaveBeenCalledTimes(1);
      // Should fallback to controller-based combination when instanceof check fails
      const callArgs = executeMock.mock.calls[0];
      expect(callArgs[2]).toBeDefined();
    });

    it("validates both signals are AbortSignal instances before using AbortSignal.any", async () => {
      const executeMock = vi.fn().mockResolvedValue({ result: "success" });
      const tool: AnyAgentTool = {
        name: "test",
        description: "test tool",
        execute: executeMock,
      };

      const validSignal = new AbortController().signal;
      const fakeSignal = {
        aborted: false,
        addEventListener: vi.fn(),
      } as unknown as AbortSignal;

      const wrapped = wrapToolWithAbortSignal(tool, fakeSignal);

      await wrapped.execute!("call-1", {}, validSignal, undefined);

      expect(executeMock).toHaveBeenCalledTimes(1);
      const callArgs = executeMock.mock.calls[0];
      // Should receive a combined signal (fallback to controller-based)
      expect(callArgs[2]).toBeInstanceOf(AbortSignal);
    });
  });
});
