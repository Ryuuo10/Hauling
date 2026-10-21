import type { IncomingMessage, ServerResponse } from 'node:http';
export function createAuthApi(options: { env: Record<string, string | undefined>; allowLocalDevelopmentOrigin?: boolean }): {
  (req: IncomingMessage, res: ServerResponse, next?: () => void): Promise<void>;
  close(): Promise<void>;
};
