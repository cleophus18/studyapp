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

  // Practice quiz for a Java sub-topic.
  await page.goto("http://localhost:5199/quiz/Loops", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForSelector(".question-card", { timeout: 8000 });
  log.quiz = {
    heading: await page.evaluate(
      () => document.querySelector(".quiz-header h1")?.textContent,
    ),
    hasNotesLink: await page.evaluate(
      () => !!document.querySelector(".quiz-note-link"),
    ),
    notesLinkText: await page.evaluate(
      () => document.querySelector(".quiz-note-link")?.textContent || null,
    ),
    progress: await page.evaluate(
      () => document.querySelector(".quiz-progress span")?.textContent,
    ),
    firstPrompt: await page.evaluate(() =>
      document.querySelector(".question-card h2")?.textContent?.slice(0, 80),
    ),
  };

  // Answer every question in the Hard tab to confirm the bank drives choice text.
  await page
    .locator(".difficulty-tabs button", { hasText: "Hard" })
    .first()
    .click();
  await page.waitForTimeout(400);
  log.hardProgress = await page.evaluate(
    () => document.querySelector(".quiz-progress span")?.textContent,
  );
  log.hardPrompt = await page.evaluate(() =>
    document.querySelector(".question-card h2")?.textContent?.slice(0, 100),
  );
  log.hardIsChoice = await page.evaluate(
    () => document.querySelectorAll(".question-card .answers .answer").length,
  );

  return log;
}
