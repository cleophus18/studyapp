const CLIENT = /\bScanner\b|\bSystem\.in\b|\bBufferedReader\b|\bJOptionPane\b/;
const cases = [
  [
    "plain hello world",
    'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
    false,
  ],
  [
    "Scanner program",
    'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String name = sc.nextLine();\n    System.out.println("Hi " + name);\n  }\n}',
    true,
  ],
  [
    "JOptionPane program",
    'import javax.swing.JOptionPane;\npublic class Main {\n  public static void main(String[] args) {\n    String t = JOptionPane.showInputDialog("Name?");\n    JOptionPane.showMessageDialog(null, t);\n  }\n}',
    true,
  ],
  [
    "System.in direct",
    "public class Main {\n  public static void main(String[] args) throws Exception {\n    int c = System.in.read();\n  }\n}",
    true,
  ],
  [
    "docs mention Scanner in a comment only",
    '// Scanner is mentioned here\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("no input");\n  }\n}',
    true,
  ],
];
let ok = true;
for (const [label, code, expected] of cases) {
  const got = CLIENT.test(code);
  const pass = got === expected;
  if (!pass) ok = false;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${label}: needsInput=${got} (expected ${expected})`,
  );
}
console.log(ok ? "\nALL EXPECTED BEHAVIOUR OK" : "\nSOME CASES DIFFER");
