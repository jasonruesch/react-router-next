import { use } from "react";

export type Notification = { id: string; title: string; time: string };

const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Deploy succeeded on staging", time: "2m ago" },
  { id: "n2", title: "New comment on “Loaders explained”", time: "14m ago" },
  { id: "n3", title: "Weekly digest is ready", time: "1h ago" },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const cache = new Map<string, Promise<Notification[]>>();

export function useNotifications(key: "ok" | "broken"): Notification[] {
  let p = cache.get(key);
  if (!p) {
    p =
      key === "broken"
        ? sleep(400).then(() => {
            throw new Error("Notifications service is down (demo).");
          })
        : sleep(600).then(() => NOTIFICATIONS);
    cache.set(key, p);
  }
  return use(p);
}
