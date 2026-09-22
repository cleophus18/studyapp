export default async function run(page) {
  const log = {};

  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@example.com" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
  });

  await page.goto("http://localhost:5199/notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForSelector(".notes-module-cards");

  // Step 1 -> Java module.
  await page
    .locator(".notes-module-cards button", { hasText: "Java" })
    .first()
    .click();
  await page.waitForSelector(".subtopic-grid", { timeout: 8000 });
  log.step2Count = await page.evaluate(
    () => document.querySelectorAll(".subtopic-card").length,
  );

  // Select two sub-topics (grid must stay put).
  await page.locator(".subtopic-card", { hasText: "Loops" }).first().click();
  await page.locator(".subtopic-card", { hasText: "Methods" }).first().click();
  log.stillOnGrid = await page.evaluate(
    () => !!document.querySelector(".subtopic-grid"),
  );
  log.selected = await page.evaluate(
    () => document.querySelectorAll(".subtopic-card.selected").length,
  );

  // Step 3.
  await page.locator(".notes-start-bar button").click();
  await page.waitForSelector(".teaching-note", { timeout: 8000 });
  log.step3 = {
    cards: await page.evaluate(
      () => document.querySelectorAll(".teaching-note").length,
    ),
    headings: await page.evaluate(() =>
      [...document.querySelectorAll(".teaching-note h2")].map(
        (el) => el.textContent,
      ),
    ),
    hasCode: await page.evaluate(() => !!document.querySelector(".note-code")),
    hasPitfalls: await page.evaluate(
      () => document.querySelectorAll(".pitfalls-block").length,
    ),
    practiceLinks: await page.evaluate(
      () =>
        [...document.querySelectorAll(".note-actions a")].filter((a) =>
          a.textContent.includes("Practice"),
        ).length,
    ),
  };

  // Sidebar controls.
  log.hamburger = await page.evaluate(
    () => !!document.querySelector(".hamburger"),
  );
  log.resizer = await page.evaluate(
    () => !!document.querySelector(".sidebar-resizer"),
  );
  log.collapseBox = await page.evaluate(() => {
    const el = document.querySelector(".side-collapse");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      w: r.width,
      h: r.height,
      x: r.x,
      y: r.y,
      visible: r.width > 0 && r.height > 0,
    };
  });
  await page.evaluate(() => document.querySelector(".side-collapse").click());
  await page.waitForTimeout(300);
  log.collapsed = await page.evaluate(() =>
    document.querySelector(".shell")?.classList.contains("sidebar-collapsed"),
  );
  await page.evaluate(() => document.querySelector(".hamburger").click());
  await page.waitForTimeout(300);
  log.reopenedAfterBurger = await page.evaluate(
    () =>
      !document
        .querySelector(".shell")
        ?.classList.contains("sidebar-collapsed"),
  );

  return log;
}
