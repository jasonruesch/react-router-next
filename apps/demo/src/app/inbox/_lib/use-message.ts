import { notFound } from "@evolonix/react-router-next";
import { use } from "react";
import type { Message } from "../data";
import { MESSAGES } from "../data";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const cache = new Map<string, Promise<Message>>();

export function useMessage(id: string): Message {
  let p = cache.get(id);
  if (!p) {
    p = sleep(600).then(() => {
      if (id === "999") {
        throw new Error(
          "Message 999 was deliberately broken to demo intercepted error.tsx.",
        );
      }
      const message = MESSAGES.find((m) => m.id === id);
      if (!message) notFound();
      return message;
    });
    cache.set(id, p);
  }
  return use(p);
}
