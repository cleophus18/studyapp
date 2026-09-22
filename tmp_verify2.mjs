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

const p = 5173;
const mod = await get(p, "/src/App.tsx");
console.log("App.tsx status:", mod.status, "len:", mod.body.length);
for (const token of [
  "HELLO_WORLD_CODE",
  "function Settings",
  "function SettingToggle",
  "loading-bar",
  "/settings",
  "dashboard-course-prompt",
]) {
  console.log(`  contains ${token}: ${mod.body.includes(token)}`);
}
// A vite transform error would return the raw source or an error overlay; check
// there is no transform error marker.
console.log(
  "  transformError:",
  mod.body.includes("Internal server error") ||
    mod.body.includes("Transform failed"),
);
