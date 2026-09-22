// ---------------------------------------------------------------------------
// Email rules for StudyLab.
//
// Students must sign up with an institutional (student) email. Personal mail
// providers are rejected — with one exception: the site founder's Gmail, which
// is the only Gmail address allowed to use the app.
// ---------------------------------------------------------------------------

/** The one Gmail address permitted to register and sign in. */
export const FOUNDER_EMAIL = "cleotshinyaleni@gmail.com";

/** Personal providers that are NOT accepted as student emails. */
const BLOCKED_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "msn.com",
  "qq.com",
  "163.com",
];

export type EmailCheck = { ok: true } | { ok: false; reason: string };

/**
 * Validate that an email is acceptable for StudyLab.
 * - Must look like an email.
 * - Personal providers are rejected unless it is the founder's address.
 */
export function checkStudentEmail(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase();
  if (!email) return { ok: false, reason: "Enter your email address." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return {
      ok: false,
      reason: "That does not look like a valid email address.",
    };
  }
  if (email === FOUNDER_EMAIL) return { ok: true };

  const domain = email.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return {
      ok: false,
      reason:
        "Please use your student (school or university) email. Personal email providers like Gmail or Yahoo are not accepted.",
    };
  }
  return { ok: true };
}

/** Is this address the founder's? Used to gate the Gmail exception. */
export function isFounder(email: string): boolean {
  return email.trim().toLowerCase() === FOUNDER_EMAIL;
}

/** Six-digit numeric code used for email verification. */
export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const PENDING_KEY = "study-pending-verification";

export type PendingVerification = {
  name: string;
  email: string;
  password: string;
  university: string;
  degree: string;
  customDegree?: string;
  code: string;
  sentAt: number;
};

/** Codes are valid for 15 minutes. */
export const CODE_TTL_MS = 15 * 60 * 1000;

export function savePendingVerification(pending: PendingVerification): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function readPendingVerification(): PendingVerification | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingVerification;
    if (!parsed?.email || !parsed?.code) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingVerification(): void {
  localStorage.removeItem(PENDING_KEY);
}

// ---------------------------------------------------------------------------
// Demo delivery / SMTP note
//
// The app has no mail server configured, so it cannot truly deliver an email
// from the browser. When the API is running, POST /api/auth/send-code is called
// and the server would deliver the message; with no mailer configured the code
// is returned so the client can surface it. This keeps the verification flow
// real and testable without inventing a fake success.
// ---------------------------------------------------------------------------
export async function requestVerificationCode(
  email: string,
  code: string,
): Promise<{ delivered: boolean; message: string }> {
  try {
    const response = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) throw new Error("send failed");
    const data = (await response.json()) as {
      delivered?: boolean;
      message?: string;
    };
    return {
      delivered: Boolean(data.delivered),
      message:
        data.message ||
        "A verification code was sent to your email. Enter it below to continue.",
    };
  } catch {
    return {
      delivered: false,
      message:
        "We could not reach the mail service, so your code is shown here instead. Enter it below to continue.",
    };
  }
}
