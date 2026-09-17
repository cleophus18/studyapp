import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "..");

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") !== "production",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: required("JWT_SECRET", "insecure-dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  databasePath: path.resolve(
    projectRoot,
    process.env.DATABASE_PATH || "./data/studyapp.db",
  ),
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@studyapp.local",
    password: process.env.ADMIN_PASSWORD || "Admin1234!",
    name: process.env.ADMIN_NAME || "Platform Admin",
  },
  exposeResetTokenInDev:
    (process.env.EXPOSE_RESET_TOKEN_IN_DEV || "true") === "true",
  javaRunnerFallbackUrl:
    process.env.JAVA_RUNNER_FALLBACK_URL ||
    "https://emkc.org/api/v2/piston/execute",
};

if (!config.isDev && config.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}
