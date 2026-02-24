const DEFAULT_SCOPES = ["profile", "email"];
const ALLOWED_SCOPES = new Set(["profile", "email", "read:user", "write:user"]);

export interface OAuthAdvancedConfig {
  requirePkce: boolean;
  requireExactRedirectUriMatch: boolean;
  rotateRefreshToken: boolean;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  allowedOrigins: string[];
  environment: "development" | "staging" | "production";
}

export function normalizeScopes(scopes?: unknown): string[] {
  if (!Array.isArray(scopes)) return DEFAULT_SCOPES;
  const normalized = scopes
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  const invalid = normalized.filter((scope) => !ALLOWED_SCOPES.has(scope));
  if (invalid.length) {
    throw new Error(`Invalid scopes: ${invalid.join(", ")}`);
  }

  return [...new Set(normalized.length ? normalized : DEFAULT_SCOPES)];
}

export function normalizeRedirectUris(redirectUris: unknown): string[] {
  if (!Array.isArray(redirectUris) || !redirectUris.length) {
    throw new Error("At least one redirect URI is required");
  }

  const normalized = redirectUris
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (!normalized.length) {
    throw new Error("At least one valid redirect URI is required");
  }

  if (normalized.length > 20) {
    throw new Error("Maximum 20 redirect URIs are allowed");
  }

  for (const uri of normalized) {
    if (uri.includes("*")) {
      throw new Error(`Wildcard redirect URIs are not allowed: ${uri}`);
    }

    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      throw new Error(`Invalid redirect URI: ${uri}`);
    }

    const localhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !localhost) {
      throw new Error(`Redirect URI must use HTTPS (except localhost): ${uri}`);
    }
  }

  return [...new Set(normalized)];
}

export function normalizeWebsite(website: unknown): string | undefined {
  if (typeof website !== "string" || !website.trim()) return undefined;
  const value = website.trim();

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Website must be a valid URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Website must use HTTPS");
  }

  return value;
}

export function buildAdvancedConfig(input: unknown, redirectUris: string[]): OAuthAdvancedConfig {
  const value = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const origins = [...new Set(redirectUris.map((uri) => new URL(uri).origin))];

  const accessTokenTtlSeconds = Number(value.accessTokenTtlSeconds ?? 3600);
  const refreshTokenTtlSeconds = Number(value.refreshTokenTtlSeconds ?? 2592000);

  if (!Number.isFinite(accessTokenTtlSeconds) || accessTokenTtlSeconds < 300 || accessTokenTtlSeconds > 86400) {
    throw new Error("accessTokenTtlSeconds must be between 300 and 86400");
  }

  if (!Number.isFinite(refreshTokenTtlSeconds) || refreshTokenTtlSeconds < 3600 || refreshTokenTtlSeconds > 7776000) {
    throw new Error("refreshTokenTtlSeconds must be between 3600 and 7776000");
  }

  const environment = typeof value.environment === "string" ? value.environment : "production";
  if (!["development", "staging", "production"].includes(environment)) {
    throw new Error("environment must be development, staging, or production");
  }

  return {
    requirePkce: value.requirePkce !== false,
    requireExactRedirectUriMatch: value.requireExactRedirectUriMatch !== false,
    rotateRefreshToken: value.rotateRefreshToken !== false,
    accessTokenTtlSeconds,
    refreshTokenTtlSeconds,
    allowedOrigins: origins,
    environment: environment as OAuthAdvancedConfig["environment"],
  };
}
