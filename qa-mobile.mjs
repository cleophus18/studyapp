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
  await page.waitForTimeout(300);

  // On a phone the sidebar should start closed (off-canvas, not overlaying content).
  log.initial = await page.evaluate(() => {
    const shell = document.querySelector(".shell");
    const sidebar = document.querySelector(".sidebar");
    const r = sidebar.getBoundingClientRect();
    return {
      menuOpen: shell?.classList.contains("menu-open"),
      sidebarLeft: Math.round(r.left),
      sidebarVisibleOnScreen: r.left >= 0 && r.width > 0,
      mainMarginLeft: getComputedStyle(document.querySelector(".main"))
        .marginLeft,
    };
  });

  // Open via the header burger.
  await page.locator(".header-burger").click();
  await page.waitForTimeout(400);
  log.afterOpen = await page.evaluate(() => {
    const r = document.querySelector(".sidebar").getBoundingClientRect();
    return {
      menuOpen: document
        .querySelector(".shell")
        ?.classList.contains("menu-open"),
      sidebarLeft: Math.round(r.left),
      sidebarOnScreen: r.left >= 0,
      burgerInsideSidebar: !!document.querySelector(".sidebar .sidebar-burger"),
    };
  });

  // The burger inside the sidebar should close it.
  await page.locator(".sidebar .sidebar-burger").click();
  await page.waitForTimeout(400);
  log.afterSidebarBurgerClose = await page.evaluate(() => ({
    menuOpen: document.querySelector(".shell")?.classList.contains("menu-open"),
    sidebarOffScreen:
      document.querySelector(".sidebar").getBoundingClientRect().left < 0,
  }));

  // Navigate: clicking a link should close the drawer on mobile.
  await page.locator(".header-burger").click();
  await page.waitForTimeout(300);
  await page.locator(".sidebar nav a", { hasText: "Notes" }).click();
  await page.waitForTimeout(500);
  log.afterNavClick = await page.evaluate(() => ({
    url: location.pathname,
    menuOpen: document.querySelector(".shell")?.classList.contains("menu-open"),
  }));

  return log;
}
