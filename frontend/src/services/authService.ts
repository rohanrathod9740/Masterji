import {
  ApiError,
  getRecord,
  getString,
  requestWithFallback,
  unwrapData,
  type RequestCandidate,
} from "@/services/api";
import type {
  AuthSession,
  LoginPayload,
  SignupPayload,
} from "@/types/auth";

const SESSION_STORAGE_KEY = "masterji.auth.session";

const loginCandidates: RequestCandidate[] = [
  { path: "/api/sign-in", method: "POST" },
];

const signupCandidates: RequestCandidate[] = [
  { path: "/api/sign-up", method: "POST" },
];

const logoutCandidates: RequestCandidate[] = [
  { path: "/api/sign-out", method: "POST" },
];

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function buildDisplayName(user: {
  name: string | null;
  email: string | null;
  phone: string | null;
}) {
  if (user.name) {
    return user.name;
  }

  if (user.email) {
    return user.email.split("@")[0] ?? user.email;
  }

  return user.phone ?? "Masterji User";
}

function normalizeSession(payload: unknown): AuthSession {
  const dataRecord = getRecord(unwrapData(payload)) ?? getRecord(payload);
  const nestedUser =
    getRecord(dataRecord, ["user"]) ??
    getRecord(payload, ["data", "user"]) ??
    getRecord(payload, ["user"]);

  if (!nestedUser) {
    throw new ApiError("The backend did not return a valid user session.");
  }

  const id = getString(nestedUser.id);

  if (!id) {
    throw new ApiError("The backend session response is missing the user id.");
  }

  const email = getString(nestedUser.email) ?? "";
  const phone = getString(nestedUser.phone);
  const name = buildDisplayName({
    name: getString(nestedUser.name),
    email,
    phone,
  });

  const token =
    getString(dataRecord?.token) ??
    getString(getRecord(payload, ["data"])?.token) ??
    getString(getRecord(payload)?.token);

  return {
    token,
    user: {
      id,
      name,
      email,
      phone,
    },
  };
}

function saveSession(session: AuthSession) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_STORAGE_KEY);
}

export async function getSession() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new ApiError("Your session has expired. Please sign in again.");
  }

  return session;
}

export async function signup(payload: SignupPayload) {
  const session = await requestWithFallback<AuthSession>({
    candidates: signupCandidates,
    body: {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      password: payload.password,
    },
    parser: normalizeSession,
  });

  saveSession(session);
  return session;
}

export async function login(payload: LoginPayload) {
  const identifier = payload.identifier.trim();

  if (!identifier || !payload.password.trim()) {
    throw new ApiError("Enter your email or phone and password to continue.");
  }

  const isEmail = identifier.includes("@");
  const session = await requestWithFallback<AuthSession>({
    candidates: loginCandidates,
    body: {
      email: isEmail ? identifier.toLowerCase() : undefined,
      phone: isEmail ? undefined : identifier,
      password: payload.password,
    },
    parser: normalizeSession,
  });

  saveSession(session);
  return session;
}

export async function logout() {
  try {
    await requestWithFallback({
      candidates: logoutCandidates,
    });
  } finally {
    clearStoredSession();
  }
}
