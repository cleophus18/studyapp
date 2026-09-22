export default async function run(page) {
  const log = {};
  await page.evaluate(() => {
    localStorage.setItem(
      "java-user",
      JSON.stringify({ name: "QA Student", email: "qa@uct.ac.za" }),
    );
    localStorage.setItem("java-token", "qa-token");
    localStorage.setItem("study-courses", JSON.stringify(["Java"]));
    sessionStorage.removeItem("study-active-test-set");
  });

  // Test page: mix pills should be gone.
  await page.goto("http://localhost:5199/test", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForSelector(".test-start-card");
  log.testIntro = await page.evaluate(() => ({
    hasMixPills: !!document.querySelector(".test-mix"),
    introText: (
      document.querySelector(".test-start-card")?.innerText || ""
    ).slice(0, 200),
    mentionsEasyMediumHard:
      /easy|medium|hard/i.test(
        document.querySelector(".test-start-card")?.innerText || "",
      ) ||
      /easy|medium|hard/i.test(
        document.querySelector(".title-row")?.innerText || "",
      ),
  }));

  // Modules page: only Java.
  await page.goto("http://localhost:5199/modules", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.modules = await page.evaluate(() => ({
    shown: [
      ...document.querySelectorAll(".module-card h2, .module-placeholder h2"),
    ].map((h) => h.textContent),
  }));

  // Course selection: only Java.
  await page.goto("http://localhost:5199/course-selection", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.courses = await page.evaluate(() => ({
    shown: [...document.querySelectorAll(".course-card strong")].map(
      (h) => h.textContent,
    ),
  }));

  // Practice: Java only, no module selector.
  await page.goto("http://localhost:5199/practice", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.practice = await page.evaluate(() => ({
    hasModuleSelect: !!document.querySelector(".module-select"),
    heading: document.querySelector(".title-row h1")?.textContent,
    eyebrow: document.querySelector(".title-row .eyebrow")?.textContent,
  }));

  return log;
}
