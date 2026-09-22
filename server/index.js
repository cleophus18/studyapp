import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { execFile, spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "./config.js";
import { q, transaction, nowIso, todayKey } from "./database/connection.js";
import { errorMiddleware, asyncHandler, badRequest, conflict, notFound } from "./utils/errors.js";
import { requireAdmin, requireAuth, signToken } from "./middleware/auth.js";

const app = express();
app.enable("trust proxy");
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "200kb" }));

// ---------------------------------------------------------------------------
// Scale: keep the API responsive for hundreds of concurrent learners.
// - A tiny in-memory rate limiter protects the auth and mail endpoints.
// - Compression is applied when the optional dependency is present.
// - Connections are kept alive so bursts are handled without re-handshaking.
// ---------------------------------------------------------------------------
try {
  const { default: compression } = await import("compression");
  app.use(compression());
} catch {
  // compression is optional; the API works without it.
}

const rateBuckets = new Map();
function rateLimit({ windowMs = 60000, max = 60 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    if (bucket.count > max) {
      res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
      return;
    }
    next();
  };
}
// Periodically drop stale buckets so memory does not grow with traffic.
const pruneTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.reset) rateBuckets.delete(key);
  }
}, 5 * 60 * 1000);
pruneTimer.unref?.();

const server = app.listen(config.port, () =>
  console.log(`studyflow API listening on http://localhost:${config.port}`),
);
// Handle far more than 400 concurrent users without dropping sockets.
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.maxConnections = 2048;

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role, university: user.university || "", degree: user.degree || "", picture: user.picture || "" });
const parseJson = (value, fallback = []) => { try { return JSON.parse(value); } catch { return fallback; } };
const execFileAsync = promisify(execFile);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "studyflow-api" }));

// Verification codes are held in memory with an expiry tied to the email.
const verificationCodes = new Map();
const CODE_TTL_MS = 15 * 60 * 1000;

app.post(
  "/api/auth/send-code",
  rateLimit({ windowMs: 60_000, max: 10 }),
  (req, res) => {
    const { email, code } = req.body || {};
    if (!email || !code) throw badRequest("An email and code are required");
    verificationCodes.set(String(email).toLowerCase(), {
      code: String(code),
      expiresAt: Date.now() + CODE_TTL_MS,
    });
    // No SMTP transport is configured, so the code cannot be truly emailed yet.
    // The client shows it in-app and verifies it on submit. Wire an SMTP
    // provider here (e.g. nodemailer) to deliver real mail.
    res.json({
      delivered: false,
      message:
        "Your verification code is ready. Enter it below to confirm your student email.",
    });
  },
);

app.post(
  "/api/auth/verify-code",
  rateLimit({ windowMs: 60_000, max: 20 }),
  (req, res) => {
    const { email, code } = req.body || {};
    const record = verificationCodes.get(String(email || "").toLowerCase());
    if (!record) throw badRequest("Request a new verification code");
    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(String(email).toLowerCase());
      throw badRequest("That code has expired. Request a new one.");
    }
    if (record.code !== String(code || "")) throw badRequest("That verification code is incorrect");
    verificationCodes.delete(String(email).toLowerCase());
    res.json({ verified: true });
  },
);

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { email, password, name, university, degree } = req.body || {};
  if (!email || !password || !name || !university || !degree || password.length < 6) throw badRequest("Name, email, university, degree and a password of at least 6 characters are required");
  const existing = q.get("SELECT id FROM users WHERE email = ?", email.toLowerCase());
  if (existing) throw conflict("An account with this email already exists");
  const now = nowIso();
  const result = q.run("INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", email.toLowerCase(), await bcrypt.hash(password, 12), name.trim(), now, now);
  const user = q.get("SELECT id, email, name, role FROM users WHERE id = ?", result.lastInsertRowid);
  q.run("INSERT INTO user_profiles (user_id, university, course, updated_at) VALUES (?, ?, ?, ?)", user.id, university.trim(), degree.trim(), now);
  user.university = university.trim();
  user.degree = degree.trim();
  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}));

app.post("/api/auth/login", rateLimit({ windowMs: 60_000, max: 30 }), asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const user = q.get("SELECT u.id, u.email, u.name, u.role, u.password_hash, u.is_active, p.university, p.course AS degree, p.avatar_color AS picture FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.email = ?", String(email || "").toLowerCase());
  if (!user || !user.is_active || !(await bcrypt.compare(password || "", user.password_hash))) throw badRequest("Email or password is incorrect");
  q.run("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?", nowIso(), nowIso(), user.id);
  res.json({ user: publicUser(user), token: signToken(user) });
}));

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.patch("/api/auth/profile", requireAuth, (req, res) => {
  const { name, university, degree, picture } = req.body || {};
  if (!String(name || "").trim()) throw badRequest("A display name is required");
  const updatedAt = nowIso();
  q.run("UPDATE users SET name = ?, updated_at = ? WHERE id = ?", String(name).trim(), updatedAt, req.user.id);
  q.run("UPDATE user_profiles SET university = ?, course = ?, avatar_color = ?, updated_at = ? WHERE user_id = ?", String(university || "").trim(), String(degree || "").trim(), String(picture || ""), updatedAt, req.user.id);
  const user = q.get("SELECT u.id, u.email, u.name, u.role, p.university, p.course AS degree, p.avatar_color AS picture FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ?", req.user.id);
  res.json({ user: publicUser(user) });
});

app.delete("/api/auth/account", requireAuth, (req, res) => {
  q.run("DELETE FROM users WHERE id = ?", req.user.id);
  res.json({ deleted: true });
});
app.post("/api/auth/password-reset", (req, res) => res.json({ message: "If the account exists, reset instructions have been sent." }));

// A program needs interactive input when it reads from the console. Programs
// without Scanner never prompt, so the client hides its input box for them.
const needsStdin = (code) =>
  /\bScanner\b|\bSystem\.in\b|\bBufferedReader\b|\bJOptionPane\b/.test(code);

// ---------------------------------------------------------------------------
// Custom JOptionPane bridge.
//
// Real JOptionPane opens a Swing window, which cannot run on a headless server
// (it throws HeadlessException). We cannot shadow javax.swing.JOptionPane either,
// because the JDK's own copy always wins on the module path.
//
// So we REWRITE the program: a default-package helper (SLDialog) is compiled
// alongside Main, and every "JOptionPane." reference is redirected to it. The
// helper speaks a tiny line protocol on stdout and reads answers from stdin; the
// browser draws an on-brand dialog and sends the typed answers back.
const JOPT_INPUT = "@@JOPT_INPUT@@";
const JOPT_MESSAGE = "@@JOPT_MESSAGE@@";
const JOPT_CONFIRM = "@@JOPT_CONFIRM@@";
const SLDIALOG_STUB = `import java.io.BufferedReader;
import java.io.InputStreamReader;

/** StudyLab helper: renders JOptionPane-style dialogs in the browser. */
public class SLDialog {
  public static final int YES_OPTION = 0;
  public static final int NO_OPTION = 1;
  public static final int CANCEL_OPTION = 2;
  public static final int OK_OPTION = 0;
  public static final int CLOSED_OPTION = -1;
  public static final int YES_NO_OPTION = 0;
  public static final int YES_NO_CANCEL_OPTION = 1;
  public static final int OK_CANCEL_OPTION = 2;
  public static final int INFORMATION_MESSAGE = 1;
  public static final int WARNING_MESSAGE = 2;
  public static final int ERROR_MESSAGE = 0;
  public static final int PLAIN_MESSAGE = -1;

  private static BufferedReader reader;

  private static synchronized String readLine() {
    try {
      if (reader == null) reader = new BufferedReader(new InputStreamReader(System.in));
      String line = reader.readLine();
      return line == null ? "" : line;
    } catch (Exception error) {
      return "";
    }
  }

  private static String asText(Object value) {
    return value == null ? "" : String.valueOf(value);
  }

  public static String showInputDialog(Object message) {
    System.out.println("${JOPT_INPUT}" + asText(message));
    System.out.flush();
    String answer = readLine();
    return answer.isEmpty() ? null : answer;
  }

  public static String showInputDialog(Object parent, Object message) {
    return showInputDialog(message);
  }

  public static String showInputDialog(Object parent, Object message, Object title, int type) {
    return showInputDialog(message);
  }

  public static String showInputDialog(Object parent, Object message, Object title, int type, Object icon, Object[] options, Object initial) {
    return showInputDialog(message);
  }

  public static void showMessageDialog(Object parent, Object message) {
    System.out.println("${JOPT_MESSAGE}|info|" + asText(message));
    System.out.flush();
  }

  public static void showMessageDialog(Object parent, Object message, Object title, int type) {
    String kind = type == 2 ? "warning" : type == 0 ? "error" : "info";
    System.out.println("${JOPT_MESSAGE}|" + kind + "|" + asText(message));
    System.out.flush();
  }

  public static int showConfirmDialog(Object parent, Object message) {
    return showConfirmDialog(parent, message, "Confirm", 0);
  }

  public static int showConfirmDialog(Object parent, Object message, Object title, int type) {
    System.out.println("${JOPT_CONFIRM}|" + type + "|" + asText(message));
    System.out.flush();
    String answer = readLine().trim().toLowerCase();
    if (answer.startsWith("y")) return YES_OPTION;
    if (answer.startsWith("n")) return NO_OPTION;
    if (answer.startsWith("c") || answer.isEmpty()) return CANCEL_OPTION;
    return YES_OPTION;
  }
}
`;
const usesJOptionPane = (code) => /\bJOptionPane\b/.test(code);

// Redirects JOptionPane usage to the StudyLab helper: drops the javax.swing
// import and swaps the class name, so the code compiles against SLDialog.
function rewriteJOptionPane(code) {
  return code
    .replace(/^\s*import\s+javax\.swing\.JOptionPane\s*;\s*$/gm, "")
    .replace(/\bJOptionPane\b/g, "SLDialog");
}

// Runs "java Main" with an optional stdin payload and resolves with the full
// stdout/stderr once the process exits (or after a timeout).
function runJavaProgram(cwd, input, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const child = spawn("java", ["-cp", cwd, "Main"], { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject({ stderr: "Execution timed out after 8 seconds.", stdout });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject({ stderr: error.message, stdout });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode });
    });
    // Feed the typed values, then close stdin so Scanner sees end-of-input.
    if (input) child.stdin.write(input.endsWith("\n") ? input : `${input}\n`);
    child.stdin.end();
  });
}

app.post("/api/code/run", asyncHandler(async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  const input = typeof req.body?.input === "string" ? req.body.input : "";
  if (!code.trim() || code.length > 12000) throw badRequest("Provide Java code under 12,000 characters");
  if (input.length > 4000) throw badRequest("Input is limited to 4,000 characters");
  if (!/\bclass\s+Main\b/.test(code)) throw badRequest("Your code must contain a public class Main");
  const joption = usesJOptionPane(code);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "javalab-"));
  const source = path.join(directory, "Main.java");
  try {
    // When the program uses JOptionPane, redirect those calls to the StudyLab
    // helper and compile that helper alongside Main.java.
    const programSource = joption ? rewriteJOptionPane(code) : code;
    await fs.writeFile(source, programSource, "utf8");
    const compileTargets = ["Main.java"];
    if (joption) {
      await fs.writeFile(path.join(directory, "SLDialog.java"), SLDIALOG_STUB, "utf8");
      compileTargets.push("SLDialog.java");
    }
    await execFileAsync("javac", compileTargets, { cwd: directory, timeout: 8000, windowsHide: true });
    const result = await runJavaProgram(directory, input);
    res.json({
      ok: true,
      output: result.stdout,
      error: result.stderr || "",
      needsInput: needsStdin(code),
      usesJOptionPane: joption,
    });
  } catch (error) {
    const detail = error?.stderr || error?.stdout || error?.message || "Java execution failed";
    res.status(422).json({ ok: false, output: "", error: detail, needsInput: needsStdin(code) });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}));

app.get("/api/modules", optionalModuleAuth, (_req, res) => {
  const modules = q.all("SELECT * FROM modules WHERE is_published = 1 ORDER BY sort_order, id").map((module) => ({ ...module, sections: q.all("SELECT * FROM sections WHERE module_id = ? ORDER BY sort_order, id", module.id).map((section) => ({ ...section, lessons: q.all("SELECT id, slug, title, summary, difficulty, estimated_minutes, xp_reward FROM lessons WHERE section_id = ? AND is_published = 1 ORDER BY sort_order, id", section.id), quiz: q.get("SELECT id, title, description, pass_percent, xp_reward FROM quizzes WHERE section_id = ? AND is_published = 1", section.id) })) }));
  res.json({ modules });
});

function optionalModuleAuth(_req, _res, next) {
  next();
}

app.get("/api/modules/:slug", (req, res) => {
  const module = q.get("SELECT * FROM modules WHERE slug = ? AND is_published = 1", req.params.slug);
  if (!module) throw notFound("Module not found");
  const sections = q.all("SELECT * FROM sections WHERE module_id = ? ORDER BY sort_order, id", module.id).map((section) => ({ ...section, lessons: q.all("SELECT * FROM lessons WHERE section_id = ? AND is_published = 1 ORDER BY sort_order, id", section.id).map((lesson) => ({ ...lesson, content: parseJson(lesson.content_json), content_json: undefined })), quiz: q.get("SELECT id, title, description, pass_percent, xp_reward FROM quizzes WHERE section_id = ? AND is_published = 1", section.id) }));
  res.json({ module: { ...module, sections } });
});

app.get("/api/lessons/:id", requireAuth, (req, res) => {
  const lesson = q.get("SELECT lessons.*, sections.title AS section_title, modules.slug AS module_slug FROM lessons JOIN sections ON sections.id = lessons.section_id JOIN modules ON modules.id = sections.module_id WHERE lessons.id = ?", req.params.id);
  if (!lesson) throw notFound("Lesson not found");
  const completion = q.get("SELECT completed_at FROM lesson_completions WHERE user_id = ? AND lesson_id = ?", req.user.id, lesson.id);
  res.json({ lesson: { ...lesson, content: parseJson(lesson.content_json), completed_at: completion?.completed_at || null } });
});

app.post("/api/lessons/:id/complete", requireAuth, (req, res) => {
  const lesson = q.get("SELECT id, xp_reward FROM lessons WHERE id = ?", req.params.id);
  if (!lesson) throw notFound("Lesson not found");
  const completedAt = nowIso();
  transaction(() => {
    const added = q.run("INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id, completed_at) VALUES (?, ?, ?)", req.user.id, lesson.id, completedAt);
    if (added.changes) {
      q.run("INSERT INTO xp_events (user_id, amount, reason, ref_type, ref_id, created_at) VALUES (?, ?, ?, ?, ?, ?)", req.user.id, lesson.xp_reward, "Lesson completed", "lesson", lesson.id, completedAt);
      q.run("UPDATE user_profiles SET xp = xp + ?, updated_at = ? WHERE user_id = ?", lesson.xp_reward, completedAt, req.user.id);
      q.run("INSERT INTO study_days (user_id, day, minutes, activities) VALUES (?, ?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET minutes = minutes + excluded.minutes, activities = activities + 1", req.user.id, todayKey(), 10);
    }
  });
  res.json({ completed: true, xp_earned: lesson.xp_reward });
});

app.get("/api/progress", requireAuth, (req, res) => {
  const profile = q.get("SELECT xp, daily_goal_minutes FROM user_profiles WHERE user_id = ?", req.user.id);
  const completed = q.all("SELECT lesson_id, completed_at FROM lesson_completions WHERE user_id = ? ORDER BY completed_at DESC", req.user.id);
  const attempts = q.all("SELECT quiz_id, score, total, percent, passed, completed_at FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC", req.user.id);
  const days = q.all("SELECT day, minutes, activities FROM study_days WHERE user_id = ? ORDER BY day DESC LIMIT 30", req.user.id);
  res.json({ xp: profile?.xp || 0, completed, attempts, study_days: days });
});

app.post("/api/quizzes/:id/attempts", requireAuth, (req, res) => {
  const quiz = q.get("SELECT id, pass_percent, xp_reward FROM quizzes WHERE id = ?", req.params.id);
  if (!quiz) throw notFound("Quiz not found");
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const questions = q.all("SELECT correct_index FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id", quiz.id);
  const score = questions.reduce((sum, item, index) => sum + (item.correct_index === answers[index] ? 1 : 0), 0);
  const percent = questions.length ? Math.round(score / questions.length * 100) : 0;
  const passed = percent >= quiz.pass_percent ? 1 : 0;
  const xpEarned = passed ? quiz.xp_reward : Math.round(quiz.xp_reward * percent / 100);
  transaction(() => {
    q.run("INSERT INTO quiz_attempts (user_id, quiz_id, score, total, percent, passed, xp_earned, answers_json, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", req.user.id, quiz.id, score, questions.length, percent, passed, xpEarned, JSON.stringify(answers), nowIso());
    q.run("INSERT INTO xp_events (user_id, amount, reason, ref_type, ref_id, created_at) VALUES (?, ?, ?, ?, ?, ?)", req.user.id, xpEarned, "Quiz completed", "quiz", quiz.id, nowIso());
    q.run("UPDATE user_profiles SET xp = xp + ?, updated_at = ? WHERE user_id = ?", xpEarned, nowIso(), req.user.id);
  });
  res.status(201).json({ score, total: questions.length, percent, passed: Boolean(passed), xp_earned: xpEarned });
});

app.get("/api/quizzes/:id", requireAuth, (req, res) => {
  const quiz = q.get("SELECT id, title, description, pass_percent, xp_reward FROM quizzes WHERE id = ? AND is_published = 1", req.params.id);
  if (!quiz) throw notFound("Quiz not found");
  const questions = q.all("SELECT id, type, difficulty, prompt, code, options_json, sort_order FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id", quiz.id).map((question) => ({ ...question, options: parseJson(question.options_json) }));
  res.json({ quiz, questions });
});

app.get("/api/leaderboard", rateLimit({ windowMs: 60_000, max: 120 }), requireAuth, (_req, res) => {
  const rows = q.all("SELECT users.id, users.name, user_profiles.xp, COUNT(DISTINCT quiz_attempts.id) AS quizzes_completed, COALESCE(ROUND(AVG(quiz_attempts.percent)), 0) AS average_score, (SELECT COUNT(*) FROM study_days recent WHERE recent.user_id = users.id AND recent.day >= date('now', '-6 day')) AS streak FROM users JOIN user_profiles ON user_profiles.user_id = users.id LEFT JOIN quiz_attempts ON quiz_attempts.user_id = users.id WHERE users.is_active = 1 GROUP BY users.id ORDER BY user_profiles.xp DESC LIMIT 100");
  res.json({ leaderboard: rows });
});

app.get("/api/admin/users", requireAuth, requireAdmin, (_req, res) => res.json({ users: q.all("SELECT id, email, name, role, is_active, created_at, last_login_at FROM users ORDER BY created_at DESC") }));
app.use(errorMiddleware);
