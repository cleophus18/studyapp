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

  await page.goto("http://localhost:5199/quiz/Arrays", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.waitForSelector(".question-card");
  log.startProgress = await page.evaluate(
    () => document.querySelector(".quiz-progress span")?.textContent,
  );

  // Answer every question: pick the LAST option each time, then Submit.
  let guard = 0;
  while (guard < 40) {
    guard += 1;
    const options = await page.evaluate(
      () => document.querySelectorAll(".question-card .answers .answer").length,
    );
    if (options === 0) break;
    await page.locator(".question-card .answers .answer").last().click();
    await page
      .getByRole("button", {
        name: /Submit answer|Next challenge|Finish & see results/i,
      })
      .click();
    await page.waitForTimeout(120);
    const inReview = await page.evaluate(
      () => !!document.querySelector(".test-review"),
    );
    if (inReview) break;
  }

  await page.waitForSelector(".test-review", { timeout: 8000 });
  log.quizReview = await page.evaluate(() => ({
    cardCount: document.querySelectorAll(".review-card").length,
    title: document.querySelector(".review-hero h1")?.textContent,
    score: document.querySelector(".review-score b")?.textContent,
    hasExplanation: !!document.querySelector(".review-note span"),
    sampleExplanation: (
      document.querySelector(".review-note span")?.textContent || ""
    ).slice(0, 100),
    marksCorrect: !!document.querySelector(".review-option.is-correct"),
    marksWrong: !!document.querySelector(".review-option.is-wrong"),
  }));

  return log;
}
