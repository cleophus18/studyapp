E export default async function run(page) {
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

  // Wait for the loading screen to disappear.
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForTimeout(300);
  log.afterLoad = {
    hasModuleCards: await page.evaluate(
      () => !!document.querySelector(".notes-module-cards"),
    ),
    hasGrid: await page.evaluate(
      () => !!document.querySelector(".subtopic-grid"),
    ),
    text: (await page.evaluate(() => document.body.innerText)).slice(0, 500),
  };

  return log;
}
