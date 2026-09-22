// Teaching notes for every Java sub-topic used across the app.
// Each sub-topic explains the idea in plain language, shows the syntax,
// walks through worked examples, and calls out the mistakes that make the
// practice questions and tests genuinely hard.

export type NoteExample = {
  /** Short label shown above the code block. */
  label: string;
  /** The Java snippet (kept intentionally small and readable). */
  code: string;
  /** What the reader should take away from the snippet. */
  takeaway: string;
};

export type SubtopicNote = {
  /** Module this sub-topic belongs to (currently "Java"). */
  module: string;
  /** The sub-topic name – matches the practice/quiz topic names exactly. */
  subtopic: string;
  /** One-line description used on the selection cards. */
  summary: string;
  /** The teaching sections, in order. */
  sections: {
    /** "Why it matters" / "How it works" style heading. */
    heading: string;
    /** Plain-language explanation (no jargon dumps). */
    body: string;
    /** Optional bullet points for steps, rules, or gotchas. */
    bullets?: string[];
  }[];
  /** Worked code examples. */
  examples: NoteExample[];
  /** Syntax cheat-sheet lines shown in a monospaced card. */
  syntax: string[];
  /** The traps that turn "easy" recall into "hard" understanding. */
  pitfalls: string[];
  /** What to re-read after a wrong answer in practice/test. */
  revision: string[];
};

const JAVA = "Java";

export const javaNotes: SubtopicNote[] = [
  {
    module: JAVA,
    subtopic: "Java Basics",
    summary: "JDK, JVM, the main method, and your first working program.",
    sections: [
      {
        heading: "How a Java program actually runs",
        body: "You write a .java file, javac turns it into bytecode, and the JVM (Java Virtual Machine) runs that bytecode. The JDK is the whole toolbox (compiler + runtime + tools); the JRE is just the runtime. That three-step chain is why one .class file runs on Windows, macOS, or Linux.",
        bullets: [
          "javac Main.java produces Main.class",
          "java Main runs the class named Main (no .class in the command)",
          "Every program starts at main, and it never returns a value",
        ],
      },
      {
        heading: "The main method is a contract",
        body: "The JVM looks for one very specific signature. Change any part of it and your program compiles but refuses to start.",
        bullets: [
          "public – the JVM must be able to call it",
          "static – it runs before any object exists",
          "void – it hands nothing back",
          "String[] args – the array of command-line arguments",
        ],
      },
    ],
    examples: [
      {
        label: "Smallest valid program",
        code: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, StudyLab!");
  }
}`,
        takeaway:
          "The class name must match the file name (Main.java) for a public class.",
      },
      {
        label: "Reading command-line arguments",
        code: `public static void main(String[] args) {
  System.out.println("Arguments given: " + args.length);
  if (args.length > 0) System.out.println("First: " + args[0]);
}`,
        takeaway:
          "args is just a String array; its length tells you how many values were passed.",
      },
    ],
    syntax: [
      "javac FileName.java        // compile",
      "java ClassName             // run",
      "public static void main(String[] args) { ... }",
      'System.out.println("text");',
    ],
    pitfalls: [
      "Naming the file differently from a public class — the compiler rejects it.",
      "Trying to run with java Main.class instead of java Main.",
      "Forgetting static on main, so the JVM cannot find it.",
    ],
    revision: [
      "Re-read the main method contract: public, static, void, String[] args.",
      "Remember the flow: source → javac → bytecode → JVM.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Data Types",
    summary: "Primitives, casting, precision, and choosing the right type.",
    sections: [
      {
        heading: "The eight primitive types",
        body: "Java has eight primitives: byte, short, int, long, float, double, char, boolean. For daily work, int holds whole numbers and double holds decimals. char holds a single character using single quotes; String is one of the most common objects, not a primitive, and uses double quotes.",
        bullets: [
          "int – whole numbers, roughly ±2 billion",
          "double – decimals with the most precision",
          "boolean – only true or false",
          "char – one character in single quotes, e.g. 'A'",
        ],
      },
      {
        heading: "Casting: widening vs narrowing",
        body: "Widening (int → double) is safe and automatic — you gain precision. Narrowing (double → int) loses information, so Java forces you to write the cast yourself. The classic trap is integer division: two ints divided give an int, so 5 / 2 is 2, not 2.5.",
        bullets: [
          "Automatic: byte → short → int → long → float → double",
          "Manual: (int) 9.99 becomes 9 (it truncates, it does not round)",
          "Cast one operand before dividing: (double) 5 / 2 gives 2.5",
        ],
      },
    ],
    examples: [
      {
        label: "Integer division trap",
        code: `int a = 5, b = 2;
System.out.println(a / b);            // 2
System.out.println((double) a / b);   // 2.5`,
        takeaway:
          "Java keeps the type of the operands; cast before the division when you want decimals.",
      },
      {
        label: "Mixing types safely",
        code: `double price = 19.99;
int quantity = 3;
double total = price * quantity;      // int widens to double
System.out.println("Total: " + total);`,
        takeaway:
          "An int operand is widened automatically when the other operand is a double.",
      },
    ],
    syntax: [
      "int count = 10;",
      "double rate = 2.5;",
      "boolean ready = true;",
      "char grade = 'A';",
      "int truncated = (int) 9.87;   // 9",
    ],
    pitfalls: [
      "Expecting 5 / 2 to give 2.5 — it gives 2.",
      "Believing (int) rounds: it always truncates toward zero.",
      "Using double for money and being surprised by tiny rounding errors.",
    ],
    revision: [
      "Widening is automatic; narrowing needs a cast and loses data.",
      "Cast one operand before dividing when decimals are needed.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Scanner",
    summary:
      "Reading console input with the right method and no stuck buffers.",
    sections: [
      {
        heading: "Getting input from the user",
        body: "Scanner reads text from a source — usually System.in. You create it once, then call the method that matches the data you want. Each method parses the token it expects.",
        bullets: [
          "nextInt() reads a whole number",
          "nextDouble() reads a decimal",
          "next() reads a single word (stops at whitespace)",
          "nextLine() reads everything up to Enter",
        ],
      },
      {
        heading: "The famous nextLine() problem",
        body: "When nextInt() reads a number it leaves the Enter key (the newline) sitting in the buffer. The nextLine() instantly returns an empty string. The fix is a throwaway nextLine() right after reading the number.",
      },
    ],
    examples: [
      {
        label: "Reading a name and an age",
        code: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("Name: ");
    String name = sc.nextLine();
    System.out.print("Age: ");
    int age = sc.nextInt();
    System.out.println(name + " is " + age);
    sc.close();
  }
}`,
        takeaway:
          "Text first, numbers second avoids the newline problem entirely.",
      },
      {
        label: "Clearing the buffer",
        code: `int age = sc.nextInt();
sc.nextLine();               // consume the leftover Enter
System.out.print("Course: ");
String course = sc.nextLine();`,
        takeaway:
          "An extra nextLine() after nextInt() keeps the following line read clean.",
      },
    ],
    syntax: [
      "import java.util.Scanner;",
      "Scanner sc = new Scanner(System.in);",
      "int n = sc.nextInt();",
      "String line = sc.nextLine();",
      "sc.close();",
    ],
    pitfalls: [
      "Reading text right after a number without clearing the newline.",
      "Forgetting the import, so Scanner is unknown.",
      "Assuming next() reads a whole line — it only reads one word.",
    ],
    revision: [
      "nextInt leaves the newline in the buffer; a spare nextLine clears it.",
      "Match the method to the data type you expect.",
    ],
  },
  {
    module: JAVA,
    subtopic: "JOptionPane",
    summary: "Simple GUI input and output dialogs with safe parsing.",
    sections: [
      {
        heading: "Dialogs instead of the console",
        body: "JOptionPane shows small pop-up dialogs. showInputDialog gives you a String back; showMessageDialog shows text; showConfirmDialog returns an int code for the button pressed. Everything you type is text, so numbers must be parsed.",
        bullets: [
          "showInputDialog → returns a String (or null if cancelled)",
          "showMessageDialog → shows a message, returns nothing",
          "showConfirmDialog → returns YES/NO/CANCEL option codes",
        ],
      },
      {
        heading: "Text in, number out",
        body: "Because the dialog always returns text, use Integer.parseInt for whole numbers and Double.parseDouble for decimals. Guard against cancel (null) and bad text to stop the program crashing.",
      },
    ],
    examples: [
      {
        label: "Guessing a number dialog",
        code: `import javax.swing.JOptionPane;

String input = JOptionPane.showInputDialog("Enter a number:");
int value = Integer.parseInt(input);
JOptionPane.showMessageDialog(null, "Double is " + (value * 2));`,
        takeaway: "Convert the returned String before doing arithmetic.",
      },
      {
        label: "Confirm dialog",
        code: `int choice = JOptionPane.showConfirmDialog(null, "Continue?");
if (choice == JOptionPane.YES_OPTION) {
  JOptionPane.showMessageDialog(null, "Continuing");
}`,
        takeaway: "Compare the returned code with JOptionPane.YES_OPTION.",
      },
    ],
    syntax: [
      "import javax.swing.JOptionPane;",
      'String t = JOptionPane.showInputDialog("Prompt");',
      "int n = Integer.parseInt(t);",
      "double d = Double.parseDouble(t);",
      'JOptionPane.showMessageDialog(null, "Message");',
    ],
    pitfalls: [
      "Trying to do maths on the dialog's String without parsing.",
      "Ignoring the null returned when the user clicks Cancel.",
      "Importing the wrong package — it is javax.swing, not java.swing.",
    ],
    revision: [
      "Dialogs always return text; parse before you calculate.",
      "Cancel returns null — check for it.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Operators",
    summary:
      "Arithmetic, precedence, comparison, and logical short-circuiting.",
    sections: [
      {
        heading: "Precedence and associativity",
        body: "Java evaluates * / % before + -, and evaluates left to right among equal operators. Parentheses override everything. This is exactly why 4 + 2 * 5 is 14, not 30.",
        bullets: [
          "% is the remainder: 7 % 3 is 1, and it works on negatives too",
          '+ with Strings concatenates, so "1" + 2 is "12"',
          "Compound forms a += 3 is shorthand for a = a + 3",
        ],
      },
      {
        heading: "Comparison and logical operators",
        body: "== compares primitive values, while equals() compares object contents. Logical operators combine conditions: && (both true), || (at least one true), ! (negate). && and || short-circuit — the right side is not evaluated when the answer is already decided.",
      },
    ],
    examples: [
      {
        label: "Precedence in practice",
        code: `System.out.println(4 + 2 * 5);     // 14
System.out.println((4 + 2) * 5);   // 30
System.out.println(10 % 3);        // 1`,
        takeaway:
          "Multiplication binds tighter than addition; parentheses change the order.",
      },
      {
        label: "Short-circuit logic",
        code: `int age = 17;
boolean teen = age >= 13 && age <= 19;
boolean canDrive = age >= 18 || hasLicence();
System.out.println(teen);          // true`,
        takeaway: "&& and || stop evaluating as soon as the result is known.",
      },
    ],
    syntax: [
      "+ - * / %",
      "== != > < >= <=",
      "&& || !",
      "a += 3;  a -= 1;  a *= 2;",
      "condition ? yes : no",
    ],
    pitfalls: [
      "Using = (assign) where == (compare) is needed.",
      "Forgetting that + on Strings concatenates instead of adding.",
      "Assuming % cannot apply to negatives (it keeps the sign of the left operand).",
    ],
    revision: [
      "Precedence order: () → * / % → + -.",
      "Use equals() for String comparison, == for primitives.",
    ],
  },
  {
    module: JAVA,
    subtopic: "If/Else & Switch",
    summary: "Branching with conditions and multi-way switch selection.",
    sections: [
      {
        heading: "if / else if / else",
        body: "An if runs its block only when the condition is true. else if chains several exclusive tests, and else catches everything that fell through. Only one branch in the chain runs.",
        bullets: [
          "Order matters: put the most specific condition first",
          "A missing else means 'do nothing' when nothing matches",
          "Braces make multi-line branches safe",
        ],
      },
      {
        heading: "switch for exact matches",
        body: "switch compares one value against several exact cases. Without break, execution falls through into the next case — a common bug. switch works with int, char, String, and enums, not with ranges or doubles.",
      },
    ],
    examples: [
      {
        label: "Grade bands",
        code: `int mark = 78;
if (mark >= 80)      System.out.println("A");
else if (mark >= 70) System.out.println("B");
else if (mark >= 60) System.out.println("C");
else                 System.out.println("Fail");`,
        takeaway:
          "Test from highest threshold downward so each band is reached correctly.",
      },
      {
        label: "switch with break",
        code: `String day = "Sat";
switch (day) {
  case "Sat":
  case "Sun":
    System.out.println("Weekend");
    break;
  default:
    System.out.println("Weekday");
}`,
        takeaway:
          "Stacking empty cases and using break avoids accidental fall-through.",
      },
    ],
    syntax: [
      "if (cond) { ... } else if (cond) { ... } else { ... }",
      "switch (value) { case X: ...; break; default: ...; }",
      "ternary: cond ? a : b",
    ],
    pitfalls: [
      "Forgetting break, causing fall-through into the next case.",
      "Using = instead of == in a condition.",
      "Trying to use a switch to check a range (>=, <=).",
    ],
    revision: [
      "if only runs the first matching branch; order is everything.",
      "switch matches exact values and needs break (or arrow form).",
    ],
  },
  {
    module: JAVA,
    subtopic: "Loops",
    summary:
      "for, while, do-while, and the control structures that repeat work.",
    sections: [
      {
        heading: "The three loops and when to use each",
        body: "A for loop is best when you know how many times to repeat (it keeps start, test, and step in one line). A while loop is best when you repeat until a condition changes. A do-while always runs the body at least once because it tests after the body.",
        bullets: [
          "for (init; condition; update) – counted repetition",
          "while (condition) – condition-driven repetition",
          "do { ... } while (condition) – runs at least once",
        ],
      },
      {
        heading: "Control structures that steer a loop",
        body: "break jumps out of the nearest loop immediately; continue skips the rest of the current iteration and moves to the next. Tracing one iteration by hand — writing the counter value before and after — is the single best way to predict a loop's output.",
      },
    ],
    examples: [
      {
        label: "Counted for loop",
        code: `for (int i = 1; i <= 5; i++) {
  System.out.print(i + " ");
}
// 1 2 3 4 5`,
        takeaway:
          "Start at 1, keep going while i <= 5, add 1 each pass — five iterations.",
      },
      {
        label: "do-while runs once",
        code: `int n = 10;
do {
  System.out.println("Runs once");
} while (n < 5);   // condition false, but body already ran`,
        takeaway:
          "The condition is checked after the body, so the body always runs at least once.",
      },
      {
        label: "continue and break",
        code: `for (int i = 1; i <= 5; i++) {
  if (i == 3) continue;   // skip 3
  if (i == 5) break;      // stop before printing 5
  System.out.print(i + " ");
}
// 1 2 4`,
        takeaway: "continue skips one pass; break leaves the loop entirely.",
      },
    ],
    syntax: [
      "for (int i = 0; i < n; i++) { ... }",
      "while (condition) { ... }",
      "do { ... } while (condition);",
      "break;   continue;",
      "for (int v : array) { ... }   // enhanced for",
    ],
    pitfalls: [
      "Off-by-one: i <= n runs one more time than i < n.",
      "Infinite loop: forgetting to update the counter inside a while.",
      "Expecting continue to exit the loop — it only skips one iteration.",
    ],
    revision: [
      "for = known count; while = unknown count; do-while = at least once.",
      "Trace one iteration: write i before and after the body.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Methods",
    summary: "Parameters, return values, overloading, and recursion.",
    sections: [
      {
        heading: "Breaking work into methods",
        body: "A method packages a task so you can call it by name. It can take parameters (inputs) and return a value (output). void means it returns nothing.",
        bullets: [
          "Parameters are separated by commas and each needs its own type",
          "return ends the method and hands a value back",
          "A void method uses return; only to exit early",
        ],
      },
      {
        heading: "Overloading and recursion",
        body: "Overloading means several methods share a name but differ in their parameter list — Java picks the best match. Recursion is a method calling itself, and it must always have a base case to stop.",
        bullets: [
          "Overloads differ by parameters, never by return type alone",
          "Every recursive method needs a base case or it overflows the stack",
        ],
      },
    ],
    examples: [
      {
        label: "Method with a return value",
        code: `static int add(int a, int b) {
  return a + b;
}
public static void main(String[] args) {
  System.out.println(add(3, 4));   // 7
}`,
        takeaway:
          "The return type int promises a whole number back to the caller.",
      },
      {
        label: "Recursion with a base case",
        code: `static int factorial(int n) {
  if (n <= 1) return 1;          // base case stops recursion
  return n * factorial(n - 1);
}`,
        takeaway: "Without the base case the method would call itself forever.",
      },
    ],
    syntax: [
      "returnType name(paramType param, ...) { ... }",
      "void name() { ... }",
      "int add(int a, int b) { return a + b; }",
      "overload: same name, different parameters",
    ],
    pitfalls: [
      "Forgetting the base case in a recursive method.",
      "Trying to overload using only a different return type.",
      "Returning a value from a void method.",
    ],
    revision: [
      "Overloads differ by parameter list, not return type.",
      "Recursion = base case + smaller self-call.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Arrays",
    summary: "Fixed-size storage, zero-based indexing, and safe traversal.",
    sections: [
      {
        heading: "Arrays store many values of one type",
        body: "An array has a fixed length decided at creation. Indexing starts at 0, so a length-5 array uses indexes 0 to 4. The last valid index is always length - 1.",
        bullets: [
          "new int[5] makes five zeros",
          "array.length is a field, not a method (no parentheses)",
          "Accessing an index outside 0..length-1 throws ArrayIndexOutOfBoundsException",
        ],
      },
      {
        heading: "Traversing arrays",
        body: "A classic for loop gives you the index, which you need to modify values. The enhanced for (for-each) gives you each value directly and is perfect for reading and totalling.",
      },
    ],
    examples: [
      {
        label: "Create, fill, and total",
        code: `int[] marks = {82, 91, 76};
int total = 0;
for (int m : marks) total += m;
System.out.println(total);              // 249
System.out.println(marks[marks.length - 1]); // 76`,
        takeaway: "for-each reads every value; length - 1 is the last index.",
      },
      {
        label: "Finding the maximum",
        code: `int[] nums = {3, 9, 4, 7};
int max = nums[0];
for (int i = 1; i < nums.length; i++) {
  if (nums[i] > max) max = nums[i];
}
System.out.println(max);   // 9`,
        takeaway: "Start max at the first element and compare the rest.",
      },
    ],
    syntax: [
      "int[] a = new int[5];",
      "int[] b = {1, 2, 3};",
      "a.length",
      "for (int v : a) { ... }",
    ],
    pitfalls: [
      "Looping while i <= a.length (goes one past the end).",
      "Writing a.length() as if it were a method.",
      "Believing you can resize an array — you cannot; use a new array.",
    ],
    revision: [
      "Indexes run 0..length-1; the loop guard is i < length.",
      "for-each for reading, indexed for editing.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Strings",
    summary: "Immutable text, key methods, comparison, and StringBuilder.",
    sections: [
      {
        heading: "Strings never change",
        body: "A String is immutable — every 'modifying' method returns a brand-new String and leaves the original untouched. That is why you must store the result: name = name.toUpperCase().",
        bullets: [
          "length() – number of characters (it is a method)",
          "charAt(i) – the character at index i",
          "substring(a, b) – characters from a up to (not including) b",
          "equals / equalsIgnoreCase – compare contents",
        ],
      },
      {
        heading: "Comparison and efficient building",
        body: "Use == only for references; use equals() to compare the actual text. When you join many pieces in a loop, use StringBuilder, which is mutable and far faster than repeated +.",
      },
    ],
    examples: [
      {
        label: "Common String methods",
        code: `String s = "StudyLab";
System.out.println(s.length());          // 8
System.out.println(s.charAt(0));         // S
System.out.println(s.substring(0, 5));   // Study
System.out.println(s.toUpperCase());     // STUDYLAB`,
        takeaway: "Each method returns a value; the original s is unchanged.",
      },
      {
        label: "Building text in a loop",
        code: `StringBuilder sb = new StringBuilder();
for (int i = 1; i <= 3; i++) sb.append(i).append(" ");
System.out.println(sb.toString().trim());  // 1 2 3`,
        takeaway:
          "StringBuilder appends cheaply; convert with toString() at the end.",
      },
    ],
    syntax: [
      'String s = "text";',
      "s.length();  s.charAt(0);  s.substring(a, b);",
      "s.equals(t);  s.equalsIgnoreCase(t);",
      "new StringBuilder().append(x).toString();",
    ],
    pitfalls: [
      "Comparing Strings with == instead of equals().",
      "Using length (no parens) on a String, or length() on an array.",
      "Expecting name.toUpperCase() to change name in place.",
    ],
    revision: [
      "Strings are immutable — capture the returned value.",
      "== compares references; equals() compares contents.",
    ],
  },
  {
    module: JAVA,
    subtopic: "OOP",
    summary: "Classes, objects, encapsulation, inheritance, and polymorphism.",
    sections: [
      {
        heading: "Classes are blueprints, objects are instances",
        body: "A class groups fields (state) and methods (behaviour). new creates an object and runs a constructor to set it up. Encapsulation means fields are private and reached through public getters/setters, so the object controls its own state.",
        bullets: [
          "Fields hold the data; methods act on it",
          "Constructors have the class name and no return type",
          "this refers to the current object",
        ],
      },
      {
        heading: "Inheritance and polymorphism",
        body: "extends lets a subclass reuse and specialise a parent. Overriding replaces a parent method with a subclass version. Polymorphism means the same method call behaves differently depending on the real object type — decided at run time.",
      },
    ],
    examples: [
      {
        label: "Encapsulated class",
        code: `public class Student {
  private String name;
  public Student(String name) { this.name = name; }
  public String getName() { return name; }
  public void setName(String n) { this.name = n; }
}

Student s = new Student("Ada");
System.out.println(s.getName());   // Ada`,
        takeaway: "The field is private; access goes through the methods.",
      },
      {
        label: "Inheritance and overriding",
        code: `class Animal { void speak() { System.out.println("..."); } }
class Dog extends Animal {
  @Override void speak() { System.out.println("Woof"); }
}
Animal a = new Dog();
a.speak();   // Woof  (polymorphism)`,
        takeaway:
          "The variable type is Animal, but the real object is a Dog, so Dog.speak runs.",
      },
    ],
    syntax: [
      "class Name { private int x; Name(int x){ this.x = x; }",
      "Name obj = new Name(5);",
      "class Child extends Parent { }",
      "@Override  // replaces a parent method",
    ],
    pitfalls: [
      "Confusing a class (blueprint) with an object (instance).",
      "Making fields public instead of using encapsulation.",
      "Expecting overloading to be resolved at run time — that is overriding.",
    ],
    revision: [
      "Object state is private; behaviour is public.",
      "Polymorphism chooses the method by the real object, at run time.",
    ],
  },
  {
    module: JAVA,
    subtopic: "Exception Handling",
    summary: "try / catch / finally, throwing, and failing safely.",
    sections: [
      {
        heading: "Catch what you can handle",
        body: "Risky code goes in try. If it throws, the matching catch runs instead of crashing the program. finally runs whether or not an exception happened — it is where cleanup lives.",
        bullets: [
          "try – code that might throw",
          "catch – handle the specific exception type",
          "finally – always runs (cleanup)",
        ],
      },
      {
        heading: "throw vs throws",
        body: "throw raises an exception right now (throw new IllegalArgumentException()); throws on a method signature warns callers that a checked exception may escape. Catch the narrowest type you can actually handle.",
      },
    ],
    examples: [
      {
        label: "try / catch / finally",
        code: `try {
  int[] a = new int[3];
  a[5] = 1;                 // out of bounds
} catch (ArrayIndexOutOfBoundsException e) {
  System.out.println("Index problem: " + e.getMessage());
} finally {
  System.out.println("Cleanup always runs");
}`,
        takeaway:
          "The bad index is handled gracefully; finally still executes.",
      },
      {
        label: "Throwing on bad input",
        code: `static void checkAge(int age) {
  if (age < 0) throw new IllegalArgumentException("Negative age");
}`,
        takeaway: "throw stops the method and reports a precise problem.",
      },
    ],
    syntax: [
      "try { ... } catch (ExceptionType e) { ... } finally { ... }",
      'throw new RuntimeException("message");',
      "void m() throws IOException { ... }",
    ],
    pitfalls: [
      "Catching Exception and ignoring it, hiding real bugs.",
      "Assuming finally is skipped when an exception occurs — it is not.",
      "Mixing up throw (do it now) and throws (may happen).",
    ],
    revision: [
      "try = risky code, catch = handler, finally = cleanup.",
      "throw raises; throws declares.",
    ],
  },
];

export const javaModules = [...new Set(javaNotes.map((note) => note.module))];

export function notesForModule(module: string): SubtopicNote[] {
  return javaNotes.filter((note) => note.module === module);
}

export function findNote(subtopic: string): SubtopicNote | undefined {
  return javaNotes.find((note) => note.subtopic === subtopic);
}
