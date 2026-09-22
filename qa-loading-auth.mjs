export default async function run(page) {
  const log = {};

  // --- 1. Loading page: exactly two elements ---
  await page.goto("http://localhost:5199/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  log.loading = await page.evaluate(() => {
    const screen = document.querySelector(".loading-screen");
    if (!screen) return { present: false };
    return {
      present: true,
      childCount: screen.children.length,
      children: [...screen.children].map(
        (el) => el.tagName + "." + (el.className || ""),
      ),
      text: screen.innerText.trim(),
    };
  });

  // --- 2. Auth page: student email validation ---
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  log.auth = await page.evaluate(() => ({
    hasCreateLink: !!document.querySelector(".switch button"),
    title: document.querySelector(".auth-card h1")?.textContent,
  }));

  // Switch to register to see the degree select + Other option.
  await page.locator(".switch button").click();
  await page.waitForTimeout(200);
  log.register = await page.evaluate(() => {
    const options = [
      ...document.querySelectorAll(".auth-card select option"),
    ].map((o) => o.textContent);
    return {
      degreeOptions: options,
      hasOther: options.includes("Other degree"),
      hasStudentHint: !!document.querySelector(".field-hint"),
    };
  });

  return log;
}
