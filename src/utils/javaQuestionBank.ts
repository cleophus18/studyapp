import type { Difficulty, Question } from "../types";

// ---------------------------------------------------------------------------
// The Java question bank.
//
// 100 questions spread across the 12 Java sub-topics. Each question is tagged
// Easy / Medium / Hard and is written to line up with the teaching notes in
// src/utils/javaNotes.ts, so a student who studies a sub-topic can answer the
// matching questions at any difficulty.
//
// Totals: 40 Easy, 40 Medium, 20 Hard (matching the 40/40/20 test mix).
// ---------------------------------------------------------------------------

type Seed = Omit<Question, "id">;

const e = (
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  code?: string,
): Seed => ({
  topic,
  difficulty: "Easy" as Difficulty,
  kind: "multiple-choice",
  prompt,
  code,
  options,
  answer,
  explanation,
});

const m = (
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  code?: string,
): Seed => ({
  topic,
  difficulty: "Medium" as Difficulty,
  kind: "multiple-choice",
  prompt,
  code,
  options,
  answer,
  explanation,
});

const h = (
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  code?: string,
): Seed => ({
  topic,
  difficulty: "Hard" as Difficulty,
  kind: "multiple-choice",
  prompt,
  code,
  options,
  answer,
  explanation,
});

const seeds: Seed[] = [
  // ======================================================================
  // Java Basics  (4 Easy, 3 Medium, 1 Hard)
  // ======================================================================
  e(
    "Java Basics",
    "Which method is the entry point of every Java application?",
    ["start()", "main()", "run()", "init()"],
    1,
    "The JVM starts a program at the method with signature public static void main(String[] args).",
  ),
  e(
    "Java Basics",
    "Which tool compiles a .java file into bytecode?",
    ["java", "javac", "jar", "javadoc"],
    1,
    "javac compiles source into a .class file; java then runs that bytecode.",
  ),
  e(
    "Java Basics",
    "Which character ends most Java statements?",
    [".", ":", ";", "#"],
    2,
    "A semicolon terminates a statement.",
  ),
  e(
    "Java Basics",
    "What is the correct way to run the compiled class Main?",
    ["java Main.class", "java Main", "run Main", "javac Main"],
    1,
    "You run with java Main — the .class extension is omitted from the command.",
  ),
  m(
    "Java Basics",
    "Which modifier lets the JVM call main without creating an object first?",
    ["final", "static", "abstract", "synchronized"],
    1,
    "static makes main belong to the class itself, so it can run before any object exists.",
  ),
  m(
    "Java Basics",
    `What does this print?\n\nSystem.out.println(args.length);`,
    ["0", "1", "A compile error", "Nothing"],
    0,
    "When the program is started with no command-line arguments, args is an empty array, so length is 0.",
  ),
  m(
    "Java Basics",
    "What is the relationship between the JDK and the JRE?",
    [
      "They are the same thing",
      "The JDK includes the JRE plus developer tools",
      "The JRE includes the JDK",
      "They are unrelated",
    ],
    1,
    "The JDK bundles the JRE (runtime) together with the compiler and other tools.",
  ),
  h(
    "Java Basics",
    `Will this program start?\n\nclass Main {\n  static void main(String[] args) {\n    System.out.println("hi");\n  }\n}`,
    [
      "Yes, it runs normally",
      "No — main is not public",
      "No — main must return int",
      "Yes, but it prints nothing",
    ],
    1,
    "The JVM requires main to be public. Without public the program compiles but the runtime cannot find a valid entry point.",
  ),

  // ======================================================================
  // Data Types  (3 Easy, 4 Medium, 2 Hard)
  // ======================================================================
  e(
    "Data Types",
    "Which type stores a whole number?",
    ["int", "double", "boolean", "char"],
    0,
    "int holds signed whole numbers.",
  ),
  e(
    "Data Types",
    "Which of these is a boolean literal?",
    ['"true"', "1", "true", "'T'"],
    2,
    "true and false are the only boolean literals.",
  ),
  e(
    "Data Types",
    "Which type would you choose for a decimal value such as 19.75?",
    ["int", "double", "char", "boolean"],
    1,
    "double stores decimal (floating-point) numbers with high precision.",
  ),
  m(
    "Data Types",
    "What is the result of (int) 9.87?",
    ["9", "10", "9.87", "0"],
    0,
    "A narrowing cast to int truncates toward zero; it does not round.",
  ),
  m(
    "Data Types",
    "What does 5 / 2 evaluate to?",
    ["2.5", "2", "3", "2.0"],
    1,
    "Both operands are int, so this is integer division: the fractional part is discarded.",
  ),
  m(
    "Data Types",
    "How do you make 5 / 2 produce 2.5?",
    [
      "(double) 5 / 2",
      "5 / (double) 2 is not allowed",
      "5.0 / 2.0 is a compile error",
      "int(5 / 2)",
    ],
    0,
    "Casting one operand to double makes the whole expression use floating-point division.",
  ),
  m(
    "Data Types",
    "Which assignment widens automatically without a cast?",
    ["double d = 7;", "int i = 7.5;", "float f = 7.5;", "int i = (int) 7.5;"],
    0,
    "int widens to double automatically because every int fits in a double.",
  ),
  h(
    "Data Types",
    `What is the value of total?\n\nint a = 7;\nint b = 2;\ndouble total = a / b;`,
    ["3.5", "3.0", "4.0", "A compile error"],
    1,
    "a / b is integer division evaluated first (3), then widened to double, giving 3.0. Cast before dividing to get 3.5.",
  ),

  // ======================================================================
  // Scanner  (3 Easy, 3 Medium, 2 Hard)
  // ======================================================================
  e(
    "Scanner",
    "Which Scanner method reads a whole number?",
    ["nextLine()", "nextInt()", "readInt()", "getInt()"],
    1,
    "nextInt() parses the next token as an int.",
  ),
  e(
    "Scanner",
    "Which import is needed for Scanner?",
    [
      "java.io.Scanner",
      "java.util.Scanner",
      "java.lang.Scanner",
      "java.input.Scanner",
    ],
    1,
    "Scanner lives in the java.util package.",
  ),
  e(
    "Scanner",
    "Which method reads an entire line of text?",
    ["next()", "nextLine()", "readLine()", "getLine()"],
    1,
    "nextLine() reads everything up to and including the newline.",
  ),
  m(
    "Scanner",
    "What is the purpose of sc.close()?",
    [
      "It deletes the Scanner",
      "It releases the input resource",
      "It clears the buffer",
      "It is required or the program will not compile",
    ],
    1,
    "close() releases the underlying resource; it is good practice but not required to compile.",
  ),
  m(
    "Scanner",
    "Which method reads a single word (stops at whitespace)?",
    ["nextLine()", "next()", "nextWord()", "read()"],
    1,
    "next() reads one whitespace-delimited token, unlike nextLine().",
  ),
  m(
    "Scanner",
    "What type does nextDouble() return?",
    ["String", "int", "double", "float"],
    2,
    "nextDouble() parses and returns a double.",
  ),
  h(
    "Scanner",
    `Why does this often return an empty line?\n\nint age = sc.nextInt();\nString name = sc.nextLine();`,
    [
      "nextLine() is broken",
      "nextInt() leaves the newline in the buffer, which nextLine() consumes",
      "Scanner cannot mix numbers and text",
      "You must call next() first",
    ],
    1,
    "nextInt() reads the number but not the Enter key. The following nextLine() immediately returns that leftover newline as an empty string.",
  ),
  h(
    "Scanner",
    "What is the safest fix for the leftover-newline problem?",
    [
      "Add an extra sc.nextLine() after sc.nextInt()",
      "Use sc.nextInt() twice",
      "Replace nextLine() with next()",
      "Close the Scanner",
    ],
    0,
    "A throwaway nextLine() consumes the pending newline so the next real read is clean.",
  ),

  // ======================================================================
  // JOptionPane  (3 Easy, 3 Medium, 2 Hard)
  // ======================================================================
  e(
    "JOptionPane",
    "Which method shows a text input dialog?",
    ["showMessageDialog", "showInputDialog", "inputDialog", "readDialog"],
    1,
    "showInputDialog returns the text the user typed (or null if cancelled).",
  ),
  e(
    "JOptionPane",
    "Which package contains JOptionPane?",
    ["java.awt", "javax.swing", "java.dialog", "java.ui"],
    1,
    "JOptionPane is part of javax.swing.",
  ),
  e(
    "JOptionPane",
    "What type does showInputDialog return?",
    ["int", "String", "boolean", "double"],
    1,
    "Input dialogs always return a String (or null when cancelled).",
  ),
  m(
    "JOptionPane",
    "How do you turn the dialog's text into a number?",
    ["Integer.parseInt(text)", "(int) text", "text.toInt()", "Number(text)"],
    0,
    "Integer.parseInt converts a numeric String to an int (Double.parseDouble for decimals).",
  ),
  m(
    "JOptionPane",
    "What does showConfirmDialog return?",
    ["A String", "An int option code", "A boolean", "A Scanner"],
    1,
    "It returns an int you compare with JOptionPane.YES_OPTION, NO_OPTION, or CANCEL_OPTION.",
  ),
  m(
    "JOptionPane",
    "What should you check before parsing an input dialog's result?",
    [
      "That the window is open",
      "That the result is not null (user pressed Cancel)",
      "That the number is prime",
      "Nothing — parsing never fails",
    ],
    1,
    "Cancel returns null, and parsing null would throw a NullPointerException.",
  ),
  h(
    "JOptionPane",
    `What happens here?\n\nString t = JOptionPane.showInputDialog("N?");\nint n = Integer.parseInt(t);\nJOptionPane.showMessageDialog(null, n * 2);`,
    [
      "It always works",
      "It fails to compile",
      "If the user types letters, parseInt throws NumberFormatException",
      "It returns a double",
    ],
    2,
    "Non-numeric input makes parseInt throw NumberFormatException, which crashes the program unless handled.",
  ),
  h(
    "JOptionPane",
    "Which statement is TRUE about showMessageDialog?",
    [
      "It returns the message text",
      "It returns nothing (void)",
      "It returns an option code",
      "It returns a boolean",
    ],
    1,
    "showMessageDialog is void — it only displays information.",
  ),

  // ======================================================================
  // Operators  (4 Easy, 3 Medium, 1 Hard)
  // ======================================================================
  e(
    "Operators",
    "What is 7 % 3?",
    ["1", "2", "3", "0"],
    0,
    "% is the remainder operator: 7 divided by 3 leaves remainder 1.",
  ),
  e(
    "Operators",
    "Which operator checks equality for primitive values?",
    ["=", "==", "equals", "!="],
    1,
    "== compares primitive values (equals() is for object contents like Strings).",
  ),
  e(
    "Operators",
    "What does ++count do?",
    [
      "Decreases count",
      "Adds one to count",
      "Multiplies by two",
      "Resets count",
    ],
    1,
    "The increment operator adds one to the variable.",
  ),
  m(
    "Operators",
    "What is 4 + 2 * 5?",
    ["30", "14", "20", "16"],
    1,
    "Multiplication happens before addition: 2 * 5 = 10, then 4 + 10 = 14.",
  ),
  m(
    "Operators",
    "What is the value of result?\n\nint a = 5;\na += 3 * 2;\nint result = a;",
    ["16", "11", "13", "10"],
    1,
    "The right side (3 * 2 = 6) is evaluated first, then folded into a: 5 + 6 = 11.",
  ),
  m(
    "Operators",
    'Which operator makes the string "1" + 2 equal to the text "12"?',
    ["+", "-", "*", "/"],
    0,
    "When either operand of + is a String, Java concatenates instead of adding.",
  ),
  h(
    "Operators",
    `What does this print?\n\nint x = 10;\nboolean b = x < 5 && (10 / 0 > 1);\nSystem.out.println(b);`,
    ["A division-by-zero error", "false", "true", "A compile error"],
    1,
    "&& short-circuits: because x < 5 is false, the right side (which would divide by zero) is never evaluated, so b is false.",
  ),

  // ======================================================================
  // If/Else & Switch  (4 Easy, 3 Medium, 1 Hard)
  // ======================================================================
  e(
    "If/Else & Switch",
    "Which keyword runs the alternative branch when an if is false?",
    ["when", "otherwise", "else", "default"],
    2,
    "else runs when the if condition is false.",
  ),
  e(
    "If/Else & Switch",
    "Which keyword labels a branch inside a switch?",
    ["if", "case", "when", "label"],
    1,
    "Each case labels a value to match.",
  ),
  e(
    "If/Else & Switch",
    "What does a missing break inside a case usually cause?",
    [
      "A compile error",
      "Fall-through into the next case",
      "An infinite loop",
      "The switch is ignored",
    ],
    1,
    "Without break, execution continues into the following case.",
  ),
  e(
    "If/Else & Switch",
    "Which types can a switch legally test?",
    ["int, char, String, enum", "Only boolean", "Only double", "Any object"],
    0,
    "switch works with int, char, String, and enums — not boolean or double.",
  ),
  m(
    "If/Else & Switch",
    "For grade bands, why must you test the highest threshold first?",
    [
      "It is faster",
      "Only the first matching branch runs, so a broad first test swallows later bands",
      "It avoids else",
      "Java requires it",
    ],
    1,
    "In an if/else-if chain only the first true branch runs, so ordering from highest to lowest is essential.",
  ),
  m(
    "If/Else & Switch",
    'What does the ternary operator return here?\n\nint n = 7;\nString s = n > 5 ? "big" : "small";',
    ["small", "big", "true", "7"],
    1,
    'n > 5 is true, so the value before the colon is chosen: "big".',
  ),
  m(
    "If/Else & Switch",
    "What is a common mistake in an if condition?",
    [
      "Using == instead of =",
      "Using = (assignment) instead of == (comparison)",
      "Adding a semicolon",
      "Using curly braces",
    ],
    1,
    "Writing if (x = 5) assigns instead of comparing and is usually a bug (or a compile error for non-boolean).",
  ),
  h(
    "If/Else & Switch",
    `What prints?\n\nint day = 2;\nswitch (day) {\n  case 1: System.out.print("Mon");\n  case 2: System.out.print("Tue");\n  case 3: System.out.print("Wed"); break;\n  default: System.out.print("?");\n}`,
    ["Tue", "TueWed", "MonTueWed", "?"],
    1,
    "Execution starts at case 2, prints Tue, falls through to case 3, prints Wed, then break stops it.",
  ),

  // ======================================================================
  // Loops  (4 Easy, 3 Medium, 2 Hard)
  // ======================================================================
  e(
    "Loops",
    "Which loop is guaranteed to run its body at least once?",
    ["for", "while", "do-while", "for-each"],
    2,
    "do-while checks its condition after the body, so the body always runs at least once.",
  ),
  e(
    "Loops",
    "Which keyword exits a loop immediately?",
    ["skip", "break", "exitLoop", "stop"],
    1,
    "break leaves the nearest loop or switch.",
  ),
  e(
    "Loops",
    "Which keyword skips to the next iteration?",
    ["continue", "next", "pass", "resume"],
    0,
    "continue skips the rest of the current iteration and moves to the next.",
  ),
  e(
    "Loops",
    "How many times does this loop run?\n\nfor (int i = 0; i < 3; i++)",
    ["2", "3", "4", "1"],
    1,
    "i takes the values 0, 1, 2 — three iterations.",
  ),
  m(
    "Loops",
    "How many times does this loop run?\n\nfor (int i = 1; i <= 5; i++)",
    ["4", "5", "6", "0"],
    1,
    "i runs 1, 2, 3, 4, 5 — five iterations because of the <= comparison.",
  ),
  m(
    "Loops",
    "What is the output?\n\nfor (int i = 1; i <= 3; i++)\n  System.out.print(i);",
    ["123", "012", "1234", "12"],
    0,
    "The loop prints 1, 2, 3 with no separator.",
  ),
  m(
    "Loops",
    "Which for-each loop correctly visits every element of int[] a?",
    [
      "for (int v : a) { }",
      "for (a : int v) { }",
      "for (int v in a) { }",
      "foreach (int v : a) { }",
    ],
    0,
    "The enhanced for loop syntax is for (type var : collection).",
  ),
  h(
    "Loops",
    `What prints?\n\nfor (int i = 1; i <= 5; i++) {\n  if (i % 2 == 0) continue;\n  System.out.print(i);\n}`,
    ["12345", "135", "246", "15"],
    1,
    "continue skips even numbers, so only the odd values 1, 3, 5 print.",
  ),
  h(
    "Loops",
    `What is wrong with this loop?\n\nint i = 0;\nwhile (i < 5) {\n  System.out.println(i);\n}`,
    [
      "Nothing is wrong",
      "i is never incremented, so it loops forever",
      "The condition must be i <= 5",
      "while cannot print",
    ],
    1,
    "If the loop variable never changes, the condition stays true and the loop never ends (infinite loop).",
  ),

  // ======================================================================
  // Methods  (3 Easy, 4 Medium, 2 Hard)
  // ======================================================================
  e(
    "Methods",
    "What does a void method return?",
    ["0", "null", "Nothing", "false"],
    2,
    "void means the method returns no value.",
  ),
  e(
    "Methods",
    "What separates a method's parameters?",
    ["Semicolons", "Commas", "Colons", "Pipes"],
    1,
    "Parameters are separated by commas, each with its own type.",
  ),
  e(
    "Methods",
    "What is recursion?",
    [
      "A method calling itself",
      "A loop keyword",
      "A field modifier",
      "A package",
    ],
    0,
    "Recursion is a method that calls itself, always with a base case to stop.",
  ),
  m(
    "Methods",
    "Which keyword sends a value back from a method?",
    ["return", "break", "yield", "out"],
    0,
    "return ends the method and hands a value to the caller.",
  ),
  m(
    "Methods",
    "What must every recursive method have?",
    ["A loop", "A base case", "A static field", "Two parameters"],
    1,
    "Without a base case, the recursion never stops and overflows the stack.",
  ),
  m(
    "Methods",
    "What distinguishes two overloaded methods?",
    [
      "Their return types",
      "Their parameter lists",
      "Their names",
      "Their access modifiers",
    ],
    1,
    "Overloads share a name but differ in the number or types of parameters.",
  ),
  m(
    "Methods",
    "What does this method return?\n\nstatic int square(int n) { return n * n; }",
    ["n", "n squared", "void", "n + n"],
    1,
    "square returns n * n, the square of its argument.",
  ),
  h(
    "Methods",
    "Why does this cause a stack overflow?\n\nstatic int f(int n) { return f(n - 1); }",
    [
      "f is not static",
      "There is no base case, so f calls itself forever",
      "Missing return type",
      "n is not declared",
    ],
    1,
    "Every recursion needs a base case; without one the calls never stop.",
  ),
  h(
    "Methods",
    "Can two methods differ ONLY by return type and still be valid overloads?",
    [
      "Yes",
      "No — the parameter list must differ",
      "Only if both are void",
      "Only for static methods",
    ],
    1,
    "Java cannot tell overloads apart by return type alone; the parameters must differ.",
  ),

  // ======================================================================
  // Arrays  (4 Easy, 3 Medium, 2 Hard)
  // ======================================================================
  e(
    "Arrays",
    "What is the first index of a Java array?",
    ["0", "1", "-1", "The array length"],
    0,
    "Java arrays are zero-based, so the first element is at index 0.",
  ),
  e(
    "Arrays",
    "Which gives the size of an array named a?",
    ["a.size()", "a.length", "a.count()", "a.capacity"],
    1,
    "Arrays expose the length field (no parentheses).",
  ),
  e(
    "Arrays",
    "Can a Java array change its length after creation?",
    ["Yes automatically", "No", "Only int arrays", "Only inside a loop"],
    1,
    "An array's length is fixed once it is created.",
  ),
  e(
    "Arrays",
    "What is the last valid index of an array of length 5?",
    ["5", "4", "6", "0"],
    1,
    "Indexes run 0 to length - 1, so the last index is 4.",
  ),
  m(
    "Arrays",
    "How many values does new int[5] hold, and what are they?",
    ["5, all 0", "5, all null", "4, all 0", "6, all 0"],
    0,
    "new int[5] creates five elements, each defaulted to 0.",
  ),
  m(
    "Arrays",
    "What does this print?\n\nint[] a = {2, 4, 6};\nSystem.out.println(a[1]);",
    ["2", "4", "6", "An error"],
    1,
    "Index 1 is the second element: 4.",
  ),
  m(
    "Arrays",
    "Which loop safely totals every element of int[] a?",
    [
      "for (int i = 0; i <= a.length; i++) sum += a[i];",
      "for (int i = 0; i < a.length; i++) sum += a[i];",
      "for (int i = 1; i < a.length; i++) sum += a[i];",
      "for (int i = 0; i < a.length(); i++) sum += a[i];",
    ],
    1,
    "The guard i < a.length visits every element without running past the end.",
  ),
  h(
    "Arrays",
    "What happens with int[] a = new int[3]; System.out.println(a[3]);",
    [
      "Prints 0",
      "Prints null",
      "Throws ArrayIndexOutOfBoundsException",
      "Compile error",
    ],
    2,
    "Valid indexes are 0 to 2; index 3 is out of bounds and throws at run time.",
  ),
  h(
    "Arrays",
    "Why is for (int i = 0; i <= a.length; i++) dangerous?",
    [
      "It skips the first element",
      "It reads one element past the end and throws",
      "It never runs",
      "It changes the array length",
    ],
    1,
    "The <= lets i reach a.length, which is one past the last valid index.",
  ),

  // ======================================================================
  // Strings  (3 Easy, 4 Medium, 2 Hard)
  // ======================================================================
  e(
    "Strings",
    "Are Java Strings mutable?",
    ["Yes", "No", "Only empty ones", "Only literal ones"],
    1,
    "Strings are immutable; methods return new Strings and leave the original unchanged.",
  ),
  e(
    "Strings",
    "Which method returns a String's character count?",
    ["size()", "length()", "count()", "chars()"],
    1,
    "String uses length() (a method), unlike arrays which use length (a field).",
  ),
  e(
    "Strings",
    "Which method compares Strings ignoring case?",
    ["sameCase()", "equalsIgnoreCase()", "compareText()", "ignoreEquals()"],
    1,
    "equalsIgnoreCase compares content without regard to letter case.",
  ),
  m(
    "Strings",
    "Which is the correct way to compare String contents?",
    ["s1 == s2", "s1.equals(s2)", "s1.compare(s2)", "s1 === s2"],
    1,
    "equals() compares the actual characters; == compares references.",
  ),
  m(
    "Strings",
    'What does "StudyLab".substring(0, 5) return?',
    ["Study", "StudyL", "tudyL", "ud"],
    0,
    'substring(0, 5) takes characters from index 0 up to (not including) 5, giving "Study".',
  ),
  m(
    "Strings",
    'What is the length of "Hello"?',
    ["4", "5", "6", "0"],
    1,
    "There are five characters: H, e, l, l, o.",
  ),
  m(
    "Strings",
    "Which class builds text efficiently in a loop?",
    ["StringBuilder", "String", "StringArray", "TextBuffer"],
    0,
    "StringBuilder is mutable, so repeated appends are far cheaper than repeated String concatenation.",
  ),
  h(
    "Strings",
    `What prints?\n\nString s = "abc";\ns.toUpperCase();\nSystem.out.println(s);`,
    ["ABC", "abc", "abcABC", "Compile error"],
    1,
    'Strings are immutable, so toUpperCase() returns a new String that is discarded. s is still "abc".',
  ),
  h(
    "Strings",
    `What is the result of comparing with ==?\n\nString a = "java";\nString b = "ja" + "va";\nSystem.out.println(a == b);`,
    [
      "true, because both literals are interned",
      "false, because + always creates a new object",
      "A compile error",
      "true only in a loop",
    ],
    0,
    "Constant String expressions are interned, so a and b point to the same pooled instance and == is true here — but equals() is still the reliable choice.",
  ),

  // ======================================================================
  // OOP  (3 Easy, 4 Medium, 2 Hard)
  // ======================================================================
  e(
    "OOP",
    "Which keyword creates an object?",
    ["class", "new", "object", "make"],
    1,
    "new allocates an object and runs its constructor.",
  ),
  e(
    "OOP",
    "Which principle hides an object's internal state?",
    ["Encapsulation", "Compilation", "Iteration", "Casting"],
    0,
    "Encapsulation keeps fields private behind public accessor methods.",
  ),
  e(
    "OOP",
    "What is a class?",
    [
      "A blueprint for objects",
      "A running program",
      "A loop",
      "A type of variable",
    ],
    0,
    "A class defines the fields and methods; objects are instances of it.",
  ),
  m(
    "OOP",
    "Which keyword is used for inheritance?",
    ["extends", "implements", "inherits", "super"],
    0,
    "A class extends its superclass to inherit its members.",
  ),
  m(
    "OOP",
    "What does this refer to inside a constructor?",
    ["The superclass", "The current object", "A static field", "The JVM"],
    1,
    "this refers to the object being constructed, useful for disambiguating fields from parameters.",
  ),
  m(
    "OOP",
    "What is polymorphism?",
    [
      "One type behaving in many forms at run time",
      "Copying an object",
      "Making fields public",
      "Compiling faster",
    ],
    0,
    "With polymorphism the method that runs depends on the real object type, decided at run time.",
  ),
  m(
    "OOP",
    "What does @Override mean?",
    [
      "The method is private",
      "The method replaces a superclass method",
      "The method runs first",
      "The method is static",
    ],
    1,
    "@Override tells the compiler the method intentionally overrides a parent method, catching typos.",
  ),
  h(
    "OOP",
    `Which method runs?\n\nclass Animal { void speak() { System.out.println("..."); } }\nclass Dog extends Animal { void speak() { System.out.println("Woof"); } }\nAnimal a = new Dog();\na.speak();`,
    ["...", "Woof", "Woof...", "Compile error"],
    1,
    "The real object is a Dog, so Dog.speak() runs — that is run-time polymorphism (overriding).",
  ),
  h(
    "OOP",
    "What is the difference between overloading and overriding?",
    [
      "They are identical",
      "Overloading = same name, different parameters (compile time); overriding = replacing a parent method (run time)",
      "Overloading is run time; overriding is compile time",
      "Overriding needs no inheritance",
    ],
    1,
    "Overloading is resolved by the compiler from the parameter list; overriding is resolved at run time from the object's real type.",
  ),

  // ======================================================================
  // Exception Handling  (3 Easy, 3 Medium, 2 Hard)
  // ======================================================================
  e(
    "Exception Handling",
    "Which block contains risky code?",
    ["try", "catch", "throw", "finally"],
    0,
    "The try block wraps code that might throw an exception.",
  ),
  e(
    "Exception Handling",
    "Which keyword raises an exception?",
    ["throws", "throw", "raise", "error"],
    1,
    "throw creates and raises an exception right now.",
  ),
  e(
    "Exception Handling",
    "Which block runs whether or not an exception occurs?",
    ["catch", "final", "finally", "always"],
    2,
    "finally runs in all cases and is used for cleanup.",
  ),
  m(
    "Exception Handling",
    "Which keyword declares that a method may pass an exception to its caller?",
    ["throw", "throws", "catch", "raises"],
    1,
    "throws appears in the method signature and documents a checked exception.",
  ),
  m(
    "Exception Handling",
    "Which block handles a caught exception?",
    ["try", "catch", "finally", "throws"],
    1,
    "catch receives and handles the thrown exception.",
  ),
  m(
    "Exception Handling",
    "What is the common superclass of all exceptions and errors?",
    ["Exception", "Throwable", "Error", "RuntimeException"],
    1,
    "Throwable is the root of the Java throwable hierarchy.",
  ),
  h(
    "Exception Handling",
    `What happens?\n\ntry {\n  throw new RuntimeException("boom");\n} finally {\n  System.out.println("cleanup");\n}`,
    [
      "cleanup prints, then the exception propagates",
      "cleanup never prints",
      "The exception is silently swallowed",
      "Compile error",
    ],
    0,
    "finally always runs; then, with no matching catch, the exception continues to propagate.",
  ),
  h(
    "Exception Handling",
    "Why is catching Exception and doing nothing dangerous?",
    [
      "It is slower",
      "It hides real bugs by swallowing every problem",
      "It is a compile error",
      "It closes the program",
    ],
    1,
    "A catch-all that ignores the error prevents you from noticing genuine failures.",
  ),
];

// Build the final 100-question bank with stable ids.
export const javaQuestionBank: Question[] = seeds.map((seed, index) => ({
  ...seed,
  id: `java-bank-${String(index + 1).padStart(3, "0")}`,
}));

export const javaBankCounts = javaQuestionBank.reduce(
  (acc, question) => {
    acc[question.difficulty] += 1;
    return acc;
  },
  { Easy: 0, Medium: 0, Hard: 0 } as Record<Difficulty, number>,
);

// ---------------------------------------------------------------------------
// Random test builder.
//
// A test is 20 questions: 40% Easy (8), 40% Medium (8), 20% Hard (4). The pick
// is random every time, but honours the difficulty mix exactly.
// ---------------------------------------------------------------------------

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomJavaTest(size = 20): Question[] {
  const easyTarget = Math.round(size * 0.4);
  const mediumTarget = Math.round(size * 0.4);
  const hardTarget = size - easyTarget - mediumTarget;

  const byDifficulty = (difficulty: Difficulty) =>
    shuffle(
      javaQuestionBank.filter((question) => question.difficulty === difficulty),
    );

  const chosen = [
    ...byDifficulty("Easy").slice(0, easyTarget),
    ...byDifficulty("Medium").slice(0, mediumTarget),
    ...byDifficulty("Hard").slice(0, hardTarget),
  ];

  // If a pool were ever short, top up from whatever remains.
  const remainder = shuffle(
    javaQuestionBank.filter((question) => !chosen.includes(question)),
  );
  let i = 0;
  while (chosen.length < size && i < remainder.length) {
    chosen.push(remainder[i]);
    i += 1;
  }

  // Shuffle the final order so difficulties are interleaved.
  return shuffle(chosen);
}
