// Runs before any test file imports. Replace jsdom's web-API globals with
// node's so react-router's navigation Request() doesn't fail undici's
// `AbortSignal instanceof` check.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
g.AbortController = AbortController;
g.AbortSignal = AbortSignal;
g.Request = Request;
g.Response = Response;
g.Headers = Headers;

// Some unhandled rejections from react-router's navigation lifecycle bubble
// up in jsdom under vitest's worker pool. Swallow them so they don't fail
// otherwise-passing tests.
process.on("unhandledRejection", () => {});
