const fs = require("fs");

// Pull the relevant definitions out of server/index.js by importing nothing —
// instead re-declare the same constants by evaluating the file's text is fragile,
// so read the file and extract the template + rewrite function via a tiny sandbox.
const src = fs.readFileSync("server/index.js", "utf8");

// Extract the JOPT constants + SLDIALOG_STUB + rewriteJOptionPane function text.
const start = src.indexOf("const JOPT_INPUT");
const end = src.indexOf('// Runs "java Main"');
const chunk = src.slice(start, end);

// Evaluate that chunk in an isolated scope to get the exports.
const factory = new Function(
  chunk +
    "\nreturn { SLDIALOG_STUB, JOPT_INPUT, JOPT_MESSAGE, JOPT_CONFIRM, rewriteJOptionPane, usesJOptionPane };",
);
const mod = factory();

console.log("=== SLDIALOG_STUB (first 25 lines) ===");
console.log(mod.SLDIALOG_STUB.split("\n").slice(0, 25).join("\n"));

console.log("\n=== marker literals present? ===");
console.log(
  "INPUT  marker in stub:",
  mod.SLDIALOG_STUB.includes('"' + mod.JOPT_INPUT + '"'),
);
console.log(
  "MESSAGE marker in stub:",
  mod.SLDIALOG_STUB.includes('"' + mod.JOPT_MESSAGE + '"'),
);
console.log(
  "CONFIRM marker in stub:",
  mod.SLDIALOG_STUB.includes('"' + mod.JOPT_CONFIRM + '"'),
);
console.log(
  "class name SLDialog:",
  mod.SLDIALOG_STUB.includes("public class SLDialog"),
);

console.log("\n=== rewriteJOptionPane test ===");
const userCode = `import javax.swing.JOptionPane;

public class Main {
    public static void main(String[] args) {

        String name = JOptionPane.showInputDialog("What is your name?");

        JOptionPane.showMessageDialog(null, "Hello, " + name + "!");
    }
}`;
const rewritten = mod.rewriteJOptionPane(userCode);
console.log(rewritten);
console.log("\n--- checks ---");
console.log("no javax.swing import:", !/import\s+javax\.swing/.test(rewritten));
console.log("no JOptionPane left:", !/\bJOptionPane\b/.test(rewritten));
console.log(
  "uses SLDialog:",
  /SLDialog\.showInputDialog/.test(rewritten) &&
    /SLDialog\.showMessageDialog/.test(rewritten),
);
