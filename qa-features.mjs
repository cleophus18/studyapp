export default async function run(page) {
  const log = {};
  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@example.com" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
    // A streak: active for the last 3 consecutive weeks.
    const monday = (weeksAgo) => {
      const d = new Date();
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day) - weeksAgo * 7);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${mm}-${dd}`;
    };
    localStorage.setItem(
      "study-streak-weeks",
      JSON.stringify([monday(2), monday(1), monday(0)]),
    );
  });

  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });

  // --- Burger inside the sidebar ---
  log.burger = await page.evaluate(() => {
    const inSidebar = !!document.querySelector(".sidebar .sidebar-burger");
    const visible = (() => {
      const el = document.querySelector(".sidebar .sidebar-burger");
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && style.display !== "none";
    })();
    return { inSidebar, visible };
  });

  // --- Streak (weekly) ---
  log.streak = await page.evaluate(
    () => document.querySelector(".sidebar .streak b")?.innerText || null,
  );

  // --- Back button present on a non-dashboard page ---
  await page.goto("http://localhost:5199/notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.backOnNotes = await page.evaluate(
    () => !!document.querySelector(".back-button"),
  );
  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.noBackOnDashboard = await page.evaluate(
    () => !document.querySelector(".back-button"),
  );

  // --- Burger toggles sidebar closed then open ---
  await page.evaluate(() =>
    document.querySelector(".sidebar .sidebar-burger").click(),
  );
  await page.waitForTimeout(250);
  log.collapsedAfterBurger = await page.evaluate(() =>
    document.querySelector(".shell")?.classList.contains("sidebar-collapsed"),
  );
  log.burgerStillVisibleWhenCollapsed = await page.evaluate(() => {
    const el = document.querySelector(".sidebar .sidebar-burger");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  await page.evaluate(() =>
    document.querySelector(".sidebar .sidebar-burger").click(),
  );
  await page.waitForTimeout(250);
  log.reopenedAfterBurger = await page.evaluate(() =>
    document.querySelector(".shell")?.classList.contains("menu-open"),
  );

  // --- Non-Java modules hidden ---
  await page.goto("http://localhost:5199/modules", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.moduleCards = await page.evaluate(() =>
    [
      ...document.querySelectorAll(".module-card h2, .module-placeholder h2"),
    ].map((el) => el.textContent),
  );

  return log;
}
