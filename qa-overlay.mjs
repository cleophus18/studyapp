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
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5199/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => !document.querySelector(".loading-screen"), {
    timeout: 20000,
  });
  await page.locator(".header-burger").click();
  await page.waitForTimeout(500);

  log.whatCovers = await page.evaluate(() => {
    const burger = document.querySelector(".sidebar .sidebar-burger");
    const r = burger.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      burgerRect: {
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      },
      topElementAtCenter: top
        ? top.tagName + "." + (top.className || "")
        : null,
      isBurger: top === burger || burger.contains(top),
      burgerDisplay: getComputedStyle(burger).display,
      burgerPointerEvents: getComputedStyle(burger).pointerEvents,
    };
  });

  // Try via DOM click (bypasses actionability).
  await page.evaluate(() =>
    document.querySelector(".sidebar .sidebar-burger").click(),
  );
  await page.waitForTimeout(400);
  log.afterDomClick = await page.evaluate(() => ({
    menuOpen: document.querySelector(".shell")?.classList.contains("menu-open"),
    offScreen:
      document.querySelector(".sidebar").getBoundingClientRect().left < 0,
  }));
  return log;
}
