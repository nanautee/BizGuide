interface UserRecord {
  email: string;
  passwordHash: string;
  domain: string;
  siteUrl: string;
  siteId: string;
  token: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __bizguideUserStore: Map<string, UserRecord> | undefined;
  // eslint-disable-next-line no-var
  var __bizguideDomainIndex: Map<string, string> | undefined;
}

const store = globalThis.__bizguideUserStore ?? new Map<string, UserRecord>();
globalThis.__bizguideUserStore = store;

const domainIndex = globalThis.__bizguideDomainIndex ?? new Map<string, string>();
globalThis.__bizguideDomainIndex = domainIndex;

/** Для демо и локальной разработки: повторная регистрация с тем же сайтом без ошибки «домен уже занят». */
function allowDuplicateDomainRegistration(): boolean {
  return (
    process.env.ALLOW_DUPLICATE_DOMAIN === "true" || process.env.NODE_ENV === "development"
  );
}

function normalizeDomain(url: string): string {
  let raw = url.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    return new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return raw.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
  }
}

function toSiteId(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
  return Buffer.from(normalized).toString("base64url");
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bizguide_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerUser(
  email: string,
  password: string,
  siteUrl: string,
): Promise<
  | { success: true; token: string; siteId: string; domain: string }
  | { success: false; error: string }
> {
  const key = email.toLowerCase().trim();

  if (store.has(key)) {
    return { success: false, error: "Пользователь с таким email уже зарегистрирован." };
  }

  const domain = normalizeDomain(siteUrl);

  if (!allowDuplicateDomainRegistration() && domainIndex.has(domain)) {
    return {
      success: false,
      error: `Домен ${domain} уже зарегистрирован. Войдите в существующий аккаунт.`,
    };
  }

  const token = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const siteId = toSiteId(siteUrl);

  const record: UserRecord = {
    email: key,
    passwordHash,
    domain,
    siteUrl: siteUrl.trim(),
    siteId,
    token,
    createdAt: new Date().toISOString(),
  };

  store.set(key, record);
  domainIndex.set(domain, key);

  return { success: true, token, siteId, domain };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<
  | { success: true; token: string; siteUrl: string; siteId: string; domain: string }
  | { success: false; error: string }
> {
  const key = email.toLowerCase().trim();
  const user = store.get(key);

  if (!user) {
    return { success: false, error: "Пользователь не найден. Зарегистрируйтесь." };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: "Неверный пароль." };
  }

  return {
    success: true,
    token: user.token,
    siteUrl: user.siteUrl,
    siteId: user.siteId,
    domain: user.domain,
  };
}

export function getUserByToken(token: string): UserRecord | null {
  for (const user of store.values()) {
    if (user.token === token) return user;
  }
  return null;
}

export function updateUserSiteUrl(token: string, siteUrl: string): void {
  for (const [key, user] of store.entries()) {
    if (user.token === token) {
      const newDomain = normalizeDomain(siteUrl);
      if (user.domain !== newDomain) {
        domainIndex.delete(user.domain);
        domainIndex.set(newDomain, key);
      }
      store.set(key, {
        ...user,
        siteUrl: siteUrl.trim(),
        domain: newDomain,
        siteId: toSiteId(siteUrl),
      });
      return;
    }
  }
}
