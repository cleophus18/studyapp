export default async function run(page) {
  const log = {};
  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@uct.ac.za" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
    localStorage.setItem(
      "java-answered",
      JSON.stringify(["java-bank-001", "java-bank-002"]),
    );
    localStorage.setItem("java-scores", JSON.stringify([70, 85, 60]));
    // 3 consecutive weeks active
    const monday = (n) => {
      const d = new Date();
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day) - n * 7);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    localStorage.setItem(
      "study-streak-weeks",
      JSON.stringify([monday(2), monday(1), monday(0)]),
    );
  });

  // Dashboard
  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.dashboard = await page.evaluate(() => ({
    welcome: document.querySelector(".title-row h1")?.textContent?.trim(),
    hasStats: document.querySelectorAll(".stat").length,
    statLabels: [...document.querySelectorAll(".stat small")].map(
      (el) => el.textContent,
    ),
    hasQuickCards: document.querySelectorAll(".quick-card").length,
    hasRecommendations: !!document.querySelector(
      ".dashboard-modules, .focus-banner",
    ),
    hasHeaderLogout: [...document.querySelectorAll("header button")].some((b) =>
      /log out/i.test(b.textContent),
    ),
    hasAccountChip: !!document.querySelector(".account-chip"),
  }));

  // Account page tabs
  await page.goto("http://localhost:5199/profile", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.account = await page.evaluate(() => ({
    tabs: [...document.querySelectorAll(".account-tabs button")].map(
      (b) => b.textContent,
    ),
    hasLogout: [...document.querySelectorAll("button")].some((b) =>
      /log out/i.test(b.textContent),
    ),
  }));

  // Open the About tab and read the auto-age.
  await page.locator(".account-tabs button", { hasText: "About" }).click();
  await page.waitForTimeout(300);
  log.about = await page.evaluate(() => ({
    heading: document.querySelector(".about-panel h2")?.textContent,
    ageLine: document.querySelector(".about-age")?.textContent,
    mentionsFounder: (
      document.querySelector(".about-panel")?.innerText || ""
    ).includes("CT TECH"),
  }));

  // Terms tab
  await page.locator(".account-tabs button", { hasText: "Terms" }).click();
  await page.waitForTimeout(300);
  log.terms = await page.evaluate(() => ({
    heading: document.querySelector(".legal-panel h2")?.textContent,
    hasSections: document.querySelectorAll(".legal-panel h3").length,
  }));

  // Progress page
  await page.goto("http://localhost:5199/progress", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.progress = await page.evaluate(() => ({
    stats: document.querySelectorAll(".stat").length,
    masteryRows: document.querySelectorAll(".mastery").length,
    quickLinks: document.querySelectorAll(".progress-link").length,
    weakest: [...document.querySelectorAll(".result-line b")]
      .slice(0, 3)
      .map((b) => b.textContent),
  }));

  // Mobile layout checks across pages
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = {};
  for (const path of [
    "/dashboard",
    "/notes",
    "/test",
    "/progress",
    "/profile",
  ]) {
    await page.goto("http://localhost:5199" + path, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => !document.querySelector(".loading-screen"),
      { timeout: 20000 },
    );
    await page.waitForTimeout(250);
    mobile[path] = await page.evaluate(() => ({
      noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 2,
      scrollW: document.documentElement.scrollWidth,
      viewW: window.innerWidth,
    }));
  }
  log.mobile = mobile;

  return log;
}
