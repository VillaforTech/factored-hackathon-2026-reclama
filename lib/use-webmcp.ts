"use client";
import { useEffect } from "react";
import { api } from "./client-types";
type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: () => Promise<unknown>;
};
type Context = {
  registerTool: (tool: Tool, options?: { signal: AbortSignal }) => void;
  unregisterTool?: (name: string) => void;
};
/** Optional progressive enhancement. All tools retain server authorization. */
export function useWebMCP(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const context =
      (document as Document & { modelContext?: Context }).modelContext ||
      (navigator as Navigator & { modelContext?: Context }).modelContext;
    if (!context) return;
    const abort = new AbortController();
    const tools: Tool[] = [
      {
        name: "reclama_list_cases",
        description:
          "Read cases in the current authenticated sandbox workspace. No financial action or mutation.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => api("cases"),
      },
      {
        name: "reclama_session_status",
        description:
          "Read current demo persona, role, expiry and synthetic snapshot. Does not disclose authentication tokens.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => api("session"),
      },
    ];
    const registered: string[] = [];
    for (const tool of tools) {
      try {
        context.registerTool(tool, { signal: abort.signal });
        registered.push(tool.name);
      } catch {
        /* Experimental API is optional; the accessible UI remains available. */
      }
    }
    return () => {
      abort.abort();
      for (const name of registered)
        try {
          context.unregisterTool?.(name);
        } catch {}
    };
  }, [enabled]);
}
