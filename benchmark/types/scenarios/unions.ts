import { deepmerge } from "../../../src/index.ts";

type Message =
  | { kind: "text"; body: string; priority?: 1 | 2 | 3 }
  | { kind: "audio"; url: string; duration: number }
  | { kind: "video"; url: string; duration: number; codec?: "h264" | "h265" };

const msgA: Message = { kind: "text", body: "hello" };
const msgB: Message = { kind: "text", body: "world", priority: 2 };
const msgC: Message = { kind: "audio", url: "/a.mp3", duration: 3 };
const msgD: Message = { kind: "video", url: "/v.mp4", duration: 10, codec: "h265" };

const envA: Record<string, string | number | boolean> = { NODE_ENV: "production", PORT: 8080 };
const envB: Record<string, string | number | boolean> = { NODE_ENV: "test", DEBUG: true };

const u01 = deepmerge(msgA, msgB);
const u02 = deepmerge(msgA, msgC);
const u03 = deepmerge(msgB, msgD);
const u04 = deepmerge(msgA, msgB, msgC, msgD);
const u05 = deepmerge(envA, envB);
const valueA: string | number | null = "a";
const u06 = deepmerge({ value: valueA }, { value: 5 });
const u07 = deepmerge({ maybe: undefined as string | number | undefined }, { maybe: "x" });
const kindB: "text" | "audio" = "text";
const payloadB: { text: string } | { audio: number } = { text: "hi" };
const u08 = deepmerge({ kind: kindB, payload: payloadB }, { kind: "audio", payload: { audio: 7 } });

export { u01, u02, u03, u04, u05, u06, u07, u08 };
