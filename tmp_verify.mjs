import http from "node:http";

function get(port, path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "localhost", port, path }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

const ports = [5173, 5174, 5175, 5176];
let found = false;
for (const p of ports) {
  try {
    const root = await get(p, "/");
    found = true;
    console.log(
      `PORT ${p} -> HTTP ${root.status}, hasRoot=${root.body.includes('id="root"')}`,
    );
    const css = await get(p, "/src/modules.css");
    console.log(
      `  settings-group=${css.body.includes("settings-group")} switch-pill=${css.body.includes("switch-pill")} dashboard-course-prompt=${css.body.includes("dashboard-course-prompt")}`,
    );
    const acss = await get(p, "/src/App.css");
    console.log(
      `  loading-bar=${acss.body.includes("loading-bar")} loadingProgress=${acss.body.includes("loadingProgress")}`,
    );
    break;
  } catch {
    console.log(`PORT ${p} -> no server`);
  }
}
if (!found) console.log("NO SERVER RUNNING");
