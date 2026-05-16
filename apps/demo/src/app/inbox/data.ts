export type Message = {
  id: string;
  subject: string;
  from: string;
  body: string;
};

export const MESSAGES: Message[] = [
  {
    id: "1",
    subject: "Welcome to the demo",
    from: "team@example.com",
    body: "Click any message to open it in a modal — the inbox list stays mounted behind it.",
  },
  {
    id: "2",
    subject: "How the modal works",
    from: "router@example.com",
    body: "The interceptor at @modal/(.)[id]/page.tsx renders inside the dialog on soft nav. Refresh the URL to see the full page version.",
  },
  {
    id: "3",
    subject: "Loading states",
    from: "router@example.com",
    body: "useMessage() suspends on a cached promise. The modal shows @modal/(.)[id]/loading.tsx until it resolves.",
  },
  {
    id: "4",
    subject: "Error states",
    from: "router@example.com",
    body: "Open the broken link below — the hook throws, and @modal/(.)[id]/error.tsx renders inside the same dialog frame.",
  },
];
