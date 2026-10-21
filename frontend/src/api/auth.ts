export type AuthRole = "customer" | "rider" | "fleet" | "admin";
export type GoogleAuthResult = { user: AuthUser; roles?: never } | { roles: AuthRole[]; user?: never };
export type AuthUser = { id: string; email: string; name: string; role: AuthRole; verificationStatus: string };
export type Registration = { email: string; password: string; name: string; role: Exclude<AuthRole, "admin">; phone?: string; businessName?: string; businessType?: string; address?: string; emergencyContact?: string; emergencyPhone?: string };

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("The account service is unavailable. Please try again shortly.");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

export const authConfig = () => fetch("/api/auth/config", { credentials: "same-origin", cache: "no-store" }).then(response => readResponse<{ googleClientId: string; csrfToken: string }>(response));

async function post<T>(path: string, body: unknown): Promise<T> {
  const config = await authConfig();
  return readResponse<T>(await fetch(`/api/auth/${path}`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-CSRF-Token": config.csrfToken }, body: JSON.stringify(body) }));
}

export const auth = {
  session: () => fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" }).then(response => readResponse<{ user: AuthUser | null }>(response)),
  login: (identifier: string, password: string, role: AuthRole) => post<{ user: AuthUser }>("login", { identifier, password, role }),
  register: (registration: Registration) => post<{ ok: boolean }>("register", registration),
  google: (credential: string, role: AuthRole | "auto", intent: "signin" | "signup" = "signin") => post<GoogleAuthResult>("google", { credential, role, intent }),
  logout: () => post<{ ok: boolean }>("logout", {}),
};
