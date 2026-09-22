export default async function run(page) {
  const log = {};
  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@uct.ac.za" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
  });

  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForTimeout(400);

  // Fonts actually rendering
  log.fonts = await page.evaluate(() => {
    const body = getComputedStyle(document.body).fontFamily;
    const h1 = document.querySelector("h1");
    const h1Font = h1 ? getComputedStyle(h1).fontFamily : null;
    const stat = document.querySelector(".stat b");
    return {
      body,
      h1: h1Font,
      statNum: stat ? getComputedStyle(stat).fontFamily : null,
      dmSansLoaded: document.fonts.check("16px 'DM Sans'"),
      frauncesLoaded: document.fonts.check("16px 'Fraunces'"),
      dmMonoLoaded: document.fonts.check("16px 'DM Mono'"),
    };
  });

  // New quiz option
  log.newQuiz = await page.evaluate(() => {
    const panel = document.querySelector(".new-quiz-panel");
    const select = document.querySelector(".new-quiz-select");
    return {
      present: !!panel,
      heading: panel?.querySelector("h2")?.textContent,
      hasSelect: !!select,
      optionCount: select ? select.options.length : 0,
      firstOption: select ? select.options[0].textContent : null,
      hasStartButton: [...(panel?.querySelectorAll("button") || [])].some((b) =>
        /start quiz/i.test(b.textContent),
      ),
    };
  });

  // Stats are all different from the Progress page
  log.dashboardStats = await page.evaluate(() =>
    [...document.querySelectorAll(".stat small")].map((el) => el.textContent),
  );

  // Start a specific-topic quiz and confirm navigation
  await page.evaluate(() => {
    const select = document.querySelector(".new-quiz-select");
    Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value",
    ).set.call(select, "Loops");
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForTimeout(150);
  await page.locator(".new-quiz-panel button").click();
  await page.waitForTimeout(800);
  log.afterStartQuiz = await page.evaluate(() => ({
    url: location.pathname,
    heading: document.querySelector(".quiz-header h1")?.textContent,
  }));

  return log;
}
