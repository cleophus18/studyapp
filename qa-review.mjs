export default async function run(page) {
  const log = {};
  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@example.com" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
    localStorage.removeItem("study-streak-weeks");
    sessionStorage.removeItem("study-active-test-set");
  });

  await page.goto("http://localhost:5199/test", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForSelector(".test-start-card");
  await page.getByRole("button", { name: /Start test and timer/i }).click();
  await page.waitForSelector(".test-question-nav");

  log.questionCount = await page.evaluate(
    () => document.querySelectorAll(".test-question-nav button").length,
  );

  // Answer all questions choosing option A each time.
  for (let i = 0; i < 20; i += 1) {
    const hasOptions = await page.evaluate(
      () => document.querySelectorAll(".test-question .answer").length,
    );
    if (hasOptions) {
      await page.locator(".test-question .answer").first().click();
    }
    if (i < 19) {
      await page.getByRole("button", { name: /Skip \/ next/i }).click();
      await page.waitForTimeout(80);
    }
  }

  await page.getByRole("button", { name: /Submit scored test/i }).click();
  await page.waitForSelector(".test-review", { timeout: 8000 });

  log.review = await page.evaluate(() => {
    const cards = document.querySelectorAll(".review-card");
    const first = cards[0];
    return {
      cardCount: cards.length,
      correctCards: document.querySelectorAll(".review-card.correct").length,
      wrongCards: document.querySelectorAll(".review-card.wrong").length,
      hasScore: !!document.querySelector(".review-score b"),
      score: document.querySelector(".review-score b")?.textContent,
      firstHasOptions: first
        ? first.querySelectorAll(".review-option").length
        : 0,
      firstHasExplanation: first
        ? !!first.querySelector(".review-note span")
        : false,
      explanationText: first
        ? (first.querySelector(".review-note span")?.textContent || "").slice(
            0,
            90,
          )
        : null,
      marksCorrectOption: document
        ? !!document.querySelector(".review-option.is-correct")
        : false,
    };
  });

  // Streak should now read 1 week (we cleared it before this attempt).
  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.streakAfterTest = await page.evaluate(
    () => document.querySelector(".sidebar .streak b")?.innerText || null,
  );

  // Mobile viewport check.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5199/notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForTimeout(400);
  log.mobile = await page.evaluate(() => {
    const headerBurger = document.querySelector(".header-burger");
    const hbStyle = headerBurger ? getComputedStyle(headerBurger) : null;
    const sbStyle = getComputedStyle(
      document.querySelector(".sidebar .sidebar-burger") || document.body,
    );
    return {
      headerBurgerVisible: hbStyle ? hbStyle.display !== "none" : false,
      sidebarBurgerVisible: sbStyle.display !== "none",
      noHorizontalScroll:
        document.documentElement.scrollWidth <= window.innerWidth + 2,
      viewport: window.innerWidth,
    };
  });

  return log;
}
