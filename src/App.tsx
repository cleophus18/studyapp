import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ctTechLogo from "./assets/CT TECH LOGO transparent.png";
import "./App.css";
import "./modules.css";
import { CourseSelection as CourseSelectionPage } from "./pages/CourseSelection";
import { Notes as NotesPage } from "./pages/Notes";
import { TimedTest as TimedTestPage } from "./pages/TimedTest";
import { popularCourses as courseCatalog } from "./utils/courseCatalog";
import { degreeCatalog } from "./utils/degreeCatalog";
import { javaQuestionBank } from "./utils/javaQuestionBank";
import { findNote } from "./utils/javaNotes";
import {
  getBestWeekStreak,
  getWeekStreak,
  hasActivityThisWeek,
  recordWeeklyActivity,
} from "./utils/streak";
import {
  CODE_TTL_MS,
  checkStudentEmail,
  clearPendingVerification,
  generateVerificationCode,
  readPendingVerification,
  requestVerificationCode,
  savePendingVerification,
} from "./utils/emailVerification";

type Difficulty = "Easy" | "Medium" | "Hard";
type User = {
  id?: number;
  name: string;
  email: string;
  role?: string;
  university?: string;
  degree?: string;
  picture?: string;
};
type Question = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  kind: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  textAnswer?: string;
  explanation: string;
};

const topics = [
  "Java Basics",
  "Data Types",
  "Scanner",
  "JOptionPane",
  "Operators",
  "If/Else & Switch",
  "Loops",
  "Methods",
  "Arrays",
  "Strings",
  "OOP",
  "Exception Handling",
];
const topicIcons = [
  "⌘",
  "◈",
  "⌨",
  "▣",
  "⊕",
  "⑂",
  "↻",
  "ƒ",
  "▤",
  "Aa",
  "◇",
  "⚠",
];
const topicDescriptions = [
  "JDK, JVM, syntax and your first program",
  "Primitives, casting and type safety",
  "Read console input confidently",
  "Build simple GUI input flows",
  "Expressions, precedence and logic",
  "Branching with clarity",
  "Repeat work without bugs",
  "Reusable, testable behavior",
  "Store and process collections",
  "Work with immutable text",
  "Classes, inheritance and design",
  "Fail safely and recover well",
];
const moduleCatalog = [
  {
    name: "Java",
    category: "Coding",
    icon: "☕",
    active: true,
    visible: true,
    description:
      "Programming fundamentals, OOP, and practical Java challenges.",
  },
  {
    name: "Mechanics",
    category: "Physics",
    icon: "⚙",
    active: true,
    visible: false,
    description: "Motion, forces, energy, and mechanical systems.",
  },
  {
    name: "JavaScript",
    category: "Coding",
    icon: "◇",
    active: false,
    visible: false,
    description: "Web programming and modern JavaScript practice.",
  },
  {
    name: "Python",
    category: "Coding",
    icon: "🐍",
    active: false,
    visible: false,
    description: "Programming, automation, and data foundations.",
  },
  {
    name: "Calculus",
    category: "Mathematics",
    icon: "∫",
    active: true,
    visible: false,
    description: "Limits, derivatives, and integration.",
  },
  {
    name: "Integral Calculus",
    category: "Mathematics",
    icon: "∑",
    active: false,
    visible: false,
    description: "Areas, antiderivatives, and definite integrals.",
  },
];

void courseCatalog;

const physicsTopics = [
  "Motion & Forces",
  "Energy & Work",
  "Waves & Sound",
  "Electricity",
  "Machines",
];
const physicsTopicIcons = ["↗", "◒", "≋", "⚡", "⚙"];
const physicsTopicDescriptions = [
  "Speed, acceleration, Newton's laws, and free-body diagrams",
  "Energy transfers, power, work, and conservation",
  "Frequency, wavelength, amplitude, and sound",
  "Charge, current, voltage, and simple circuits",
  "Levers, pulleys, gears, efficiency, and mechanical advantage",
];
const calculusTopics = [
  "Preliminaries & Functions",
  "Limits",
  "Infinite Limits",
  "Continuity",
  "The Derivative",
  "Differentiation Rules",
  "Chain Rule",
  "Implicit Differentiation",
  "Transcendental Functions",
  "L’Hôpital’s Rule",
  "Taylor & Maclaurin",
  "Maxima & Minima",
  "Mean Value Theorem",
  "Curve Sketching",
];
const calculusTopicIcons = [
  "∿",
  "→",
  "∞",
  "◌",
  "d",
  "ƒ",
  "⛓",
  "↔",
  "π",
  "H",
  "Σ",
  "↗",
  "≡",
  "⌁",
];
const calculusTopicDescriptions = [
  "Algebra review, domains, ranges, graphs, and function transformations",
  "Evaluate limits numerically, graphically, and algebraically",
  "Recognise vertical asymptotes and describe unbounded behaviour",
  "Use the three conditions required for a function to be continuous",
  "Interpret derivative as a rate of change and tangent slope",
  "Apply product, quotient, and power rules accurately",
  "Differentiate composite functions from the outside in",
  "Differentiate equations where y is not isolated",
  "Differentiate exponential, logarithmic, and trigonometric functions",
  "Resolve suitable indeterminate limits with repeated derivatives",
  "Approximate functions with polynomial expansions",
  "Find and classify stationary points using derivative tests",
  "Connect average and instantaneous rates of change",
  "Use derivatives to analyse increasing, decreasing, and concavity behaviour",
];
const calculusQuestions: Question[] = calculusTopics.flatMap((topic, index) => [
  {
    id: `calculus-${index}-easy`,
    topic,
    difficulty: "Easy" as Difficulty,
    kind: "multiple-choice",
    prompt: `${topic}: Which habit gives the most reliable first step?`,
    options: [
      "Write the definition and known conditions",
      "Guess from the graph",
      "Ignore the domain",
      "Round before calculating",
    ],
    answer: 0,
    explanation:
      "Start from the definition, conditions, and domain before applying a shortcut.",
  },
  {
    id: `calculus-${index}-medium`,
    topic,
    difficulty: "Medium" as Difficulty,
    kind: "written answer",
    prompt: `${topic}: Name the key check that prevents a common mistake in this topic.`,
    options: [],
    answer: 0,
    textAnswer: "domain",
    explanation:
      "Checking the domain and conditions keeps the calculus argument valid.",
  },
  {
    id: `calculus-${index}-exercise`,
    topic,
    difficulty: "Medium" as Difficulty,
    kind: "written answer",
    prompt: `${topic} exercise: Enter the key word or condition you must state before solving.`,
    options: [],
    answer: 0,
    textAnswer: "domain",
    explanation:
      "State the domain and conditions before applying a calculus rule.",
  },
  {
    id: `calculus-${index}-equation`,
    topic,
    difficulty: "Medium" as Difficulty,
    kind: "equation",
    prompt: `${topic} equation exercise: If f(x) = x² + 3x, what is f'(x)?`,
    options: ["2x + 3", "x + 3", "2x", "x² + 3"],
    answer: 0,
    explanation: "Differentiate x² and 3x term by term: f'(x) = 2x + 3.",
  },
  {
    id: `calculus-${index}-application`,
    topic,
    difficulty: "Hard" as Difficulty,
    kind: "written answer",
    prompt: `${topic} exercise: Write one check you should perform after calculating.`,
    options: [],
    answer: 0,
    textAnswer: "check",
    explanation: "Check the units, domain, sign, and behaviour of your result.",
  },
  {
    id: `calculus-${index}-hard`,
    topic,
    difficulty: "Hard" as Difficulty,
    kind: "written answer",
    prompt: `${topic}: Solve a challenging problem using the correct definition or theorem, show each step, and justify your final result.`,
    options: [],
    answer: 0,
    textAnswer: "show steps",
    explanation:
      "A hard calculus solution should name the relevant theorem or rule, show the algebra clearly, and verify the result against the domain or conditions.",
  },
]);
const calculusEquations = [
  ["Limit laws", "lim (f(x) + g(x)) = lim f(x) + lim g(x)"],
  ["Continuity", "f is continuous at a when lim(x→a) f(x) = f(a)"],
  [
    "Derivative from first principles",
    "f′(x) = lim(h→0) [f(x + h) − f(x)] / h",
  ],
  ["Power rule", "d/dx [xⁿ] = n xⁿ⁻¹"],
  ["Product rule", "d/dx [uv] = u′v + uv′"],
  ["Quotient rule", "d/dx [u/v] = (u′v − uv′) / v²"],
  ["Chain rule", "d/dx [f(g(x))] = f′(g(x)) · g′(x)"],
  ["Exponential function", "d/dx [eˣ] = eˣ"],
  ["Logarithm", "d/dx [ln x] = 1/x,  x > 0"],
  ["Trigonometric functions", "d/dx [sin x] = cos x;  d/dx [cos x] = −sin x"],
  [
    "L’Hôpital’s rule",
    "lim f/g = lim f′/g′ when the original limit is 0/0 or ∞/∞",
  ],
  ["Taylor polynomial", "Tₙ(x) = Σ(k=0 to n) f⁽ᵏ⁾(a)(x − a)ᵏ / k!"],
  ["Critical points", "f′(c) = 0 or f′(c) is undefined"],
  ["Mean Value Theorem", "f′(c) = [f(b) − f(a)] / (b − a),  a < c < b"],
];
const calculusExercises = [
  {
    topic: "Preliminaries & Functions",
    prompt: "Find the domain of f(x) = (x + 4) / (x² − 9).",
    answer: "All real x except x = −3 and x = 3: (−∞, −3) ∪ (−3, 3) ∪ (3, ∞).",
  },
  {
    topic: "Preliminaries & Functions",
    prompt:
      "Given f(x) = 2x − 3 and g(x) = 2 − x, find (f + g)(x) and (f − g)(x).",
    answer: "(f + g)(x) = x − 1 and (f − g)(x) = 3x − 5.",
  },
  {
    topic: "Preliminaries & Functions",
    prompt: "Form the composition (f ∘ g)(x) when f(x) = 2x + 5 and g(x) = x².",
    answer: "(f ∘ g)(x) = f(x²) = 2x² + 5; the domain is all real x.",
  },
  {
    topic: "Preliminaries & Functions",
    prompt: "Form the composition (f ∘ g)(x) when f(x) = √x and g(x) = x² + 5.",
    answer: "(f ∘ g)(x) = √(x² + 5); the domain is all real x.",
  },
  {
    topic: "Preliminaries & Functions",
    prompt: "Find (f ∘ g ∘ h)(x) when f(x) = 4x, g(x) = x − 1, and h(x) = x².",
    answer: "(f ∘ g ∘ h)(x) = 4(x² − 1) = 4x² − 4.",
  },
  {
    topic: "Preliminaries & Functions",
    prompt: "Find the domain of h(x) = 1 / (4 − x² + 5x).",
    answer: "Exclude the roots of x² − 5x − 4 = 0, so x ≠ (5 ± √41) / 2.",
  },
  {
    topic: "Limits",
    prompt: "Use the limit laws to find lim(x→2) (x² + 3x − 1).",
    answer: "Substitute x = 2: 4 + 6 − 1 = 9.",
  },
  {
    topic: "Infinite Limits",
    prompt: "Describe the behaviour of f(x) = 1/(x − 3)² as x approaches 3.",
    answer: "The function grows without bound: lim(x→3) 1/(x − 3)² = +∞.",
  },
  {
    topic: "Continuity",
    prompt:
      "State the three checks needed to prove that f is continuous at x = a.",
    answer:
      "f(a) must exist, lim(x→a) f(x) must exist, and the limit must equal f(a).",
  },
  {
    topic: "The Derivative",
    prompt:
      "Use the derivative definition to find the slope of f(x) = x² at x = 3.",
    answer: "f′(3) = lim(h→0) [(3+h)²−9]/h = 6.",
  },
  {
    topic: "Differentiation Rules",
    prompt: "Differentiate y = x³ + 4x² − 5x + 2.",
    answer: "y′ = 3x² + 8x − 5.",
  },
  {
    topic: "Chain Rule",
    prompt: "Differentiate y = (3x² + 1)⁴.",
    answer: "y′ = 4(3x² + 1)³ · 6x = 24x(3x² + 1)³.",
  },
  {
    topic: "Implicit Differentiation",
    prompt: "Find dy/dx when x² + y² = 25.",
    answer: "2x + 2y(dy/dx) = 0, so dy/dx = −x/y.",
  },
  {
    topic: "Transcendental Functions",
    prompt: "Differentiate y = eˣ ln(x).",
    answer: "By the product rule, y′ = eˣ ln(x) + eˣ/x.",
  },
  {
    topic: "L’Hôpital’s Rule",
    prompt: "Evaluate lim(x→0) sin(x)/x.",
    answer: "It is 0/0, so L’Hôpital gives lim cos(x)/1 = 1.",
  },
  {
    topic: "Taylor & Maclaurin",
    prompt:
      "Write the first three non-zero terms of the Maclaurin series for eˣ.",
    answer: "eˣ ≈ 1 + x + x²/2! (with further terms x³/3!, ...).",
  },
  {
    topic: "Maxima & Minima",
    prompt: "Find the critical point of f(x) = x² − 4x + 1.",
    answer: "f′(x) = 2x − 4 = 0, so x = 2; since f″(x) = 2, it is a minimum.",
  },
  {
    topic: "Mean Value Theorem",
    prompt: "Find c for f(x) = x² on [1, 3] using the Mean Value Theorem.",
    answer: "The average slope is (9−1)/(3−1) = 4; 2c = 4, so c = 2.",
  },
  {
    topic: "Curve Sketching",
    prompt: "For f(x) = x³ − 3x, find the stationary points.",
    answer:
      "f′(x) = 3x² − 3 = 0, so x = ±1; the points are (−1, 2) and (1, −2).",
  },
];

type QuestionSeed = {
  prompt: string;
  options?: string[];
  answer?: number;
  textAnswer?: string;
  explanation: string;
  code?: string;
};
const questionBanks: Array<{ easy: QuestionSeed[] }> = [
  {
    easy: [
      {
        prompt: "Which method starts a Java application?",
        options: ["start()", "main()", "run()", "init()"],
        answer: 1,
        explanation: "Java begins at public static void main(String[] args).",
      },
      {
        prompt: "Which tool compiles a .java file?",
        options: ["java", "javac", "jar", "javadoc"],
        answer: 1,
        explanation: "javac compiles source code into bytecode.",
      },
      {
        prompt: "What symbol ends most Java statements?",
        options: [".", ":", ";", "#"],
        answer: 2,
        explanation: "Java statements normally end with a semicolon.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which type stores a whole number?",
        options: ["int", "double", "boolean", "char"],
        answer: 0,
        explanation: "int stores signed whole numbers.",
      },
      {
        prompt: "Which value is a boolean literal?",
        options: ['"true"', "1", "true", "'T'"],
        answer: 2,
        explanation: "true and false are boolean literals.",
      },
      {
        prompt: "What is the default value of an instance int field?",
        options: ["null", "0", "1", "-1"],
        answer: 1,
        explanation: "Instance int fields default to zero.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which Scanner method reads a complete integer?",
        options: ["nextLine()", "nextInt()", "readInt()", "getInt()"],
        answer: 1,
        explanation: "nextInt() parses the next integer token.",
      },
      {
        prompt: "Which import provides Scanner?",
        options: [
          "java.io.Scanner",
          "java.util.Scanner",
          "java.lang.Scanner",
          "java.input.Scanner",
        ],
        answer: 1,
        explanation: "Scanner is in java.util.",
      },
      {
        prompt: "What should close a Scanner reading System.in?",
        options: [
          "scanner.close()",
          "scanner.stop()",
          "System.close()",
          "scanner.end()",
        ],
        answer: 0,
        explanation: "close() releases the Scanner resource.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which method creates a text input dialog?",
        options: [
          "showMessageDialog",
          "showInputDialog",
          "inputDialog",
          "readDialog",
        ],
        answer: 1,
        explanation: "JOptionPane.showInputDialog returns entered text.",
      },
      {
        prompt: "Which package contains JOptionPane?",
        options: ["java.awt", "javax.swing", "java.dialog", "java.ui"],
        answer: 1,
        explanation: "JOptionPane is part of javax.swing.",
      },
      {
        prompt: "What does showConfirmDialog return?",
        options: [
          "A String",
          "An int choice code",
          "A boolean only",
          "A Scanner",
        ],
        answer: 1,
        explanation: "It returns an integer representing the selected option.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "What is 7 % 3?",
        options: ["1", "2", "3", "0"],
        answer: 0,
        explanation: "The remainder after 7 divided by 3 is 1.",
      },
      {
        prompt: "Which operator checks equality for primitives?",
        options: ["=", "==", "equals", "!="],
        answer: 1,
        explanation: "== compares primitive values.",
      },
      {
        prompt: "What does ++count do?",
        options: [
          "Decreases count",
          "Adds one to count",
          "Multiplies by two",
          "Resets count",
        ],
        answer: 1,
        explanation: "The increment operator adds one.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which keyword handles the alternative branch?",
        options: ["when", "otherwise", "else", "default"],
        answer: 2,
        explanation: "else runs when the if condition is false.",
      },
      {
        prompt: "Which type is commonly used in a switch?",
        options: ["String", "Only boolean", "Only double", "File"],
        answer: 0,
        explanation:
          "Modern Java switch supports String and several primitive types.",
      },
      {
        prompt: "What does a missing break usually cause in switch?",
        options: [
          "Compilation always fails",
          "Fall-through",
          "The switch repeats forever",
          "The JVM exits",
        ],
        answer: 1,
        explanation: "Execution continues into the next case without break.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which loop is guaranteed to run once?",
        options: ["for", "while", "do-while", "foreach only"],
        answer: 2,
        explanation: "do-while checks its condition after the body.",
      },
      {
        prompt: "Which keyword exits a loop?",
        options: ["skip", "break", "exitLoop", "stop"],
        answer: 1,
        explanation: "break exits the nearest loop or switch.",
      },
      {
        prompt: "Which keyword skips to the next iteration?",
        options: ["continue", "next", "pass", "resume"],
        answer: 0,
        explanation: "continue skips the remaining body for that iteration.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "What does a void method return?",
        options: ["0", "null", "Nothing", "false"],
        answer: 2,
        explanation: "void means the method returns no value.",
      },
      {
        prompt: "What separates method parameters?",
        options: ["Semicolons", "Commas", "Colons", "Pipes"],
        answer: 1,
        explanation: "Parameters are separated with commas.",
      },
      {
        prompt: "What is recursion?",
        options: [
          "A method calling itself",
          "A loop keyword",
          "A field modifier",
          "A package",
        ],
        answer: 0,
        explanation: "A recursive method calls itself with a base case.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "What is the first index of an array?",
        options: ["0", "1", "-1", "The array length"],
        answer: 0,
        explanation: "Java arrays use zero-based indexing.",
      },
      {
        prompt: "Which property gives an array size?",
        options: ["size()", "length", "count()", "capacity"],
        answer: 1,
        explanation: "Arrays expose length, not a length method.",
      },
      {
        prompt: "Can a Java array change length after creation?",
        options: [
          "Yes automatically",
          "No",
          "Only for int[]",
          "Only in a loop",
        ],
        answer: 1,
        explanation: "Array length is fixed after creation.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Are Java Strings mutable?",
        options: ["Yes", "No", "Only static Strings", "Only empty Strings"],
        answer: 1,
        explanation: "String objects are immutable.",
      },
      {
        prompt: "Which method returns String character count?",
        options: ["size()", "length()", "count()", "chars()"],
        answer: 1,
        explanation: "String uses the length() method.",
      },
      {
        prompt: "Which method ignores case when comparing Strings?",
        options: [
          "sameCase()",
          "equalsIgnoreCase()",
          "compareText()",
          "ignoreEquals()",
        ],
        answer: 1,
        explanation:
          "equalsIgnoreCase compares contents without case sensitivity.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "What keyword creates an object?",
        options: ["class", "new", "object", "make"],
        answer: 1,
        explanation: "new invokes a constructor and allocates an object.",
      },
      {
        prompt: "Which method initializes a new object?",
        options: ["A constructor", "A getter", "main", "A package"],
        answer: 0,
        explanation: "Constructors initialize objects.",
      },
      {
        prompt: "Which principle hides internal state?",
        options: ["Encapsulation", "Compilation", "Iteration", "Casting"],
        answer: 0,
        explanation: "Encapsulation protects state behind a public interface.",
      },
    ],
  },
  {
    easy: [
      {
        prompt: "Which block contains risky code?",
        options: ["try", "catch", "throw", "finally"],
        answer: 0,
        explanation: "The try block contains code that may throw.",
      },
      {
        prompt: "Which keyword manually raises an exception?",
        options: ["throws", "throw", "raise", "error"],
        answer: 1,
        explanation: "throw creates and raises an exception instance.",
      },
      {
        prompt: "Which block usually runs whether an exception occurs or not?",
        options: ["catch", "final", "finally", "always"],
        answer: 2,
        explanation: "finally is used for cleanup.",
      },
    ],
  },
];
const mediumBanks: QuestionSeed[][] = [
  [
    {
      prompt: "Type the entry-point method name.",
      textAnswer: "main()",
      explanation: "The entry point is main().",
    },
    {
      prompt: "What command compiles Main.java?",
      textAnswer: "javac Main.java",
      explanation: "javac compiles Java source.",
    },
    {
      prompt: "Type the keyword used to declare a class.",
      textAnswer: "class",
      explanation: "class declares a class.",
    },
  ],
  [
    {
      prompt: "Which type should store 19.75?",
      textAnswer: "double",
      explanation: "double stores decimal values.",
    },
    {
      prompt: "Type the literal for a true boolean.",
      textAnswer: "true",
      explanation: "true is a boolean literal.",
    },
    {
      prompt: "What is the result of casting (int) 9.8?",
      textAnswer: "9",
      explanation: "Casting to int removes the fractional part.",
    },
  ],
  [
    {
      prompt: "Type the Scanner method that reads a line.",
      textAnswer: "nextLine()",
      explanation: "nextLine reads the remaining line.",
    },
    {
      prompt: "Which Scanner method reads a decimal?",
      textAnswer: "nextDouble()",
      explanation: "nextDouble parses a double.",
    },
    {
      prompt: "Type the keyword used to import Scanner.",
      textAnswer: "import",
      explanation: "import makes a class available by name.",
    },
  ],
  [
    {
      prompt: "Type the JOptionPane method used for a message.",
      textAnswer: "showMessageDialog",
      explanation: "showMessageDialog displays a message.",
    },
    {
      prompt: "Which type does showInputDialog return?",
      textAnswer: "String",
      explanation: "Dialog input is returned as text.",
    },
    {
      prompt: "Type the class name used for Swing dialogs.",
      textAnswer: "JOptionPane",
      explanation: "JOptionPane provides standard dialogs.",
    },
  ],
  [
    {
      prompt: "Type the operator for logical AND.",
      textAnswer: "&&",
      explanation: "&& requires both conditions to be true.",
    },
    {
      prompt: "What is 4 + 2 * 5?",
      textAnswer: "14",
      explanation: "Multiplication is evaluated before addition.",
    },
    {
      prompt: "Type the shorthand assignment for x = x + 3.",
      textAnswer: "x += 3",
      explanation: "The compound assignment adds three.",
    },
  ],
  [
    {
      prompt: "Type the keyword for the fallback branch.",
      textAnswer: "else",
      explanation: "else handles a false if condition.",
    },
    {
      prompt: "What keyword labels a switch branch?",
      textAnswer: "case",
      explanation: "case labels a matching switch value.",
    },
    {
      prompt: "Type the conditional operator symbols.",
      textAnswer: "?:",
      explanation: "The ternary operator uses ? and :.",
    },
  ],
  [
    {
      prompt: "Type the loop keyword that checks before running.",
      textAnswer: "while",
      explanation: "while checks its condition first.",
    },
    {
      prompt: "What does a loop counter commonly use to move up one?",
      textAnswer: "++",
      explanation: "++ increments a value by one.",
    },
    {
      prompt: "Type the keyword that skips an iteration.",
      textAnswer: "continue",
      explanation: "continue moves to the next iteration.",
    },
  ],
  [
    {
      prompt: "Type the keyword used to send a value back.",
      textAnswer: "return",
      explanation: "return exits a method with a value.",
    },
    {
      prompt: "What is a method signature used for overloading?",
      textAnswer: "name and parameters",
      explanation: "Overloads differ by parameter list.",
    },
    {
      prompt: "Type the term for a method calling itself.",
      textAnswer: "recursion",
      explanation: "Recursion is self-invocation with a base case.",
    },
  ],
  [
    {
      prompt: "Type the array declaration keyword used with allocation.",
      textAnswer: "new",
      explanation: "new allocates the array.",
    },
    {
      prompt: "What is the last index of an array with length 5?",
      textAnswer: "4",
      explanation: "The last index is length minus one.",
    },
    {
      prompt: "Type the loop often used to visit every array value.",
      textAnswer: "for-each",
      explanation: "The enhanced for loop traverses values directly.",
    },
  ],
  [
    {
      prompt: "Type the method used to compare String contents.",
      textAnswer: "equals()",
      explanation: "equals compares String contents.",
    },
    {
      prompt: "What does trim() remove?",
      textAnswer: "whitespace",
      explanation: "trim removes leading and trailing whitespace.",
    },
    {
      prompt: "Type the class used for efficient mutable text.",
      textAnswer: "StringBuilder",
      explanation: "StringBuilder supports mutable text operations.",
    },
  ],
  [
    {
      prompt: "Type the keyword used for inheritance.",
      textAnswer: "extends",
      explanation: "extends connects a class to its superclass.",
    },
    {
      prompt:
        "What OOP concept allows one interface with many implementations?",
      textAnswer: "polymorphism",
      explanation: "Polymorphism lets one type represent many forms.",
    },
    {
      prompt: "Type the keyword that prevents a class from being extended.",
      textAnswer: "final",
      explanation: "A final class cannot be subclassed.",
    },
  ],
  [
    {
      prompt: "Type the block that handles an exception.",
      textAnswer: "catch",
      explanation: "catch handles a thrown exception.",
    },
    {
      prompt: "Which keyword declares a method may pass an exception?",
      textAnswer: "throws",
      explanation: "throws documents checked exceptions.",
    },
    {
      prompt: "Type the common superclass of exceptions and errors.",
      textAnswer: "Throwable",
      explanation: "Throwable is the root of Java throwable types.",
    },
  ],
];
const hardChallenges = [
  {
    topic: "Java Basics",
    title: "Command-line profile builder",
    prompt:
      "Build a program that collects a student name, university, and study goal, then prints a formatted profile card.",
    requirement:
      "Use a Main class, variables, console input, validation for blank values, and a clear multi-line result.",
    deliverables: [
      "Read three values from the user",
      "Reject blank input",
      "Print a formatted profile summary",
    ],
  },
  {
    topic: "Data Types",
    title: "Grade and finance converter",
    prompt:
      "Build a converter that accepts a percentage, study hours, and monthly budget, then prints safely formatted values.",
    requirement:
      "Use appropriate primitive types, explicit casting where needed, and clear decimal formatting.",
    deliverables: [
      "Convert percentage to a decimal",
      "Calculate weekly budget from monthly budget",
      "Avoid losing decimal precision",
    ],
  },
  {
    topic: "Scanner",
    title: "Console survey collector",
    prompt:
      "Build a console survey that collects a student name, age, course, and three weekly study-hour values.",
    requirement:
      "Use Scanner correctly, handle numeric input, and print the average study time.",
    deliverables: [
      "Read text and numbers",
      "Calculate an average",
      "Handle invalid numeric input without crashing",
    ],
  },
  {
    topic: "JOptionPane",
    title: "GUI contact card",
    prompt:
      "Build a JOptionPane application that collects contact details and displays a confirmation summary.",
    requirement:
      "Use input dialogs, parse numeric data safely, and show a final confirmation dialog.",
    deliverables: [
      "Collect at least four fields",
      "Validate required fields",
      "Display a confirmation or error dialog",
    ],
  },
  {
    topic: "Operators",
    title: "Personal budget calculator",
    prompt:
      "Build a budget calculator that receives income and three expenses and reports the remaining balance and savings percentage.",
    requirement:
      "Use arithmetic, comparison, and logical operators with meaningful validation.",
    deliverables: [
      "Calculate total expenses",
      "Show remaining balance",
      "Warn when expenses exceed income",
    ],
  },
  {
    topic: "If/Else & Switch",
    title: "Student result classifier",
    prompt:
      "Build a result classifier that accepts a mark and menu choice, then assigns a grade and recommendation.",
    requirement: "Combine if/else validation with switch-based menu handling.",
    deliverables: [
      "Validate a mark from 0 to 100",
      "Assign a grade band",
      "Provide a recommendation through a menu",
    ],
  },
  {
    topic: "Loops",
    title: "Study streak tracker",
    prompt:
      "Build a seven-day study tracker that records daily minutes and reports totals, averages, and the best day.",
    requirement:
      "Use loops, counters, validation, and at least one nested or repeated decision.",
    deliverables: [
      "Collect seven daily values",
      "Calculate total and average",
      "Identify the highest study day",
    ],
  },
  {
    topic: "Methods",
    title: "Reusable quiz engine",
    prompt:
      "Build a small console quiz using separate methods for displaying questions, reading answers, scoring, and printing results.",
    requirement:
      "Use parameters, return values, method overloading or recursion, and clear method responsibilities.",
    deliverables: [
      "Create at least four methods",
      "Return and calculate a score",
      "Print feedback based on the result",
    ],
  },
  {
    topic: "Arrays",
    title: "Marks analytics tool",
    prompt:
      "Build an application that stores marks in arrays and reports minimum, maximum, average, and sorted order.",
    requirement:
      "Traverse arrays safely and implement searching or sorting without relying on collection classes.",
    deliverables: [
      "Read multiple marks",
      "Find min, max, and average",
      "Search for a requested mark or sort the values",
    ],
  },
  {
    topic: "Strings",
    title: "Text analysis utility",
    prompt:
      "Build a text analyzer that counts words, vowels, digits, and palindrome status for user input.",
    requirement:
      "Use String methods and StringBuilder where useful, while handling empty input.",
    deliverables: [
      "Normalize the text",
      "Count selected character groups",
      "Report whether the text is a palindrome",
    ],
  },
  {
    topic: "OOP",
    title: "Library lending system",
    prompt:
      "Build an object-oriented library system with books, members, borrowing, returning, and availability tracking.",
    requirement:
      "Use classes, constructors, encapsulation, inheritance or interfaces, and polymorphic behavior.",
    deliverables: [
      "Model at least three classes",
      "Prevent unavailable books from being borrowed",
      "Print a lending report",
    ],
  },
  {
    topic: "Exception Handling",
    title: "Safe banking terminal",
    prompt:
      "Build a banking terminal that supports deposits, withdrawals, and balance checks without crashing on invalid input.",
    requirement:
      "Use custom or standard exceptions, try/catch/finally, and meaningful error messages.",
    deliverables: [
      "Reject negative transactions",
      "Prevent overdrafts",
      "Recover from invalid numeric input",
    ],
  },
];
const questions: Question[] = topics.flatMap((topic, topicIndex) =>
  (["Easy", "Medium", "Hard"] as Difficulty[]).flatMap(
    (difficulty): Question[] => {
      const challenge =
        difficulty === "Hard" ? hardChallenges[topicIndex] : null;
      const seeds =
        difficulty === "Easy"
          ? questionBanks[topicIndex].easy
          : mediumBanks[topicIndex];
      if (challenge)
        return Array.from(
          { length: 3 },
          (_, variant): Question => ({
            id: `${topicIndex}-hard-${variant}`,
            topic,
            difficulty,
            kind: "coding challenge",
            prompt: `${challenge.title}: ${["Plan the data flow and input validation.", "Build the core feature and handle edge cases.", "Produce a clear result and robust error handling."][variant]}`,
            options: [],
            answer: 0,
            explanation: `${challenge.requirement} There is no guided solution in Hard mode.`,
          }),
        );
      return seeds.map((seed, variant) => ({
        id: `${topicIndex}-${difficulty.toLowerCase()}-${variant}`,
        topic,
        difficulty,
        kind: difficulty === "Medium" ? "written answer" : "multiple-choice",
        prompt: `${topic}: ${seed.prompt}`,
        code: seed.code,
        options: seed.options || [],
        answer: seed.answer ?? 0,
        textAnswer: seed.textAnswer,
        explanation: seed.explanation,
      }));
    },
  ),
);
const physicsQuestions: Question[] = physicsTopics.flatMap(
  (topic, topicIndex) => [
    {
      id: `physics-${topicIndex}-easy`,
      topic,
      difficulty: "Easy" as Difficulty,
      kind: "multiple-choice",
      prompt: `${topic}: Which approach is the best first step when solving a ${topic.toLowerCase()} problem?`,
      options: [
        "Name the known values and units",
        "Guess the answer",
        "Skip the diagram",
        "Change units at random",
      ],
      answer: 0,
      explanation:
        "Listing known values and units makes the relationship and required formula clear.",
    },
    {
      id: `physics-${topicIndex}-medium`,
      topic,
      difficulty: "Medium" as Difficulty,
      kind: "written answer",
      prompt: `${topic}: Type the word for checking whether an answer has sensible units.`,
      options: [],
      answer: 0,
      textAnswer: "dimensional analysis",
      explanation:
        "Dimensional analysis checks that the units on both sides of a calculation agree.",
    },
    {
      id: `physics-${topicIndex}-hard`,
      topic,
      difficulty: "Hard" as Difficulty,
      kind: "written answer",
      prompt: `${topic}: Solve a multi-step problem, identify the governing law, show your working, and include the correct SI units.`,
      options: [],
      answer: 0,
      textAnswer: "show working",
      explanation:
        "For a difficult physics problem, define the known values, choose the law, keep units consistent, and check whether the final result is physically reasonable.",
    },
  ],
);
const expandedCalculusQuestions = calculusTopics.flatMap(
  (topic, topicIndex) => {
    const baseQuestions = calculusQuestions.filter(
      (question) => question.topic === topic,
    );
    return Array.from({ length: 24 }, (_, variant) => {
      const question = baseQuestions[variant % baseQuestions.length];
      return {
        ...question,
        id: `calculus-${topicIndex}-question-${variant + 1}`,
        prompt:
          variant < baseQuestions.length
            ? question.prompt
            : `${question.prompt} (Exercise ${variant + 1})`,
      };
    });
  },
);
const allQuestions = [
  ...questions,
  ...physicsQuestions,
  ...expandedCalculusQuestions,
];

function api<T>(path: string, options?: RequestInit): Promise<T> {
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  }).then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Something went wrong");
    return body as T;
  });
}

function App() {
  // Routed pages live under src/pages.
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("java-user") || "null"),
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem("java-theme") === "dark",
  );
  const [answered, setAnswered] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("java-answered") || "[]"),
  );
  const [scores, setScores] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("java-scores") || "[]"),
  );
  const [xp, setXp] = useState(() =>
    Number(localStorage.getItem("java-xp") || 320),
  );
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("study-courses") || "[]"),
  );
  useEffect(() => {
    document.title = "StudyLab – Learn by doing";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);
  const authenticate = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    localStorage.setItem("java-user", JSON.stringify(nextUser));
    localStorage.setItem("java-token", nextToken);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("java-user");
    localStorage.removeItem("java-token");
  };
  const recordQuiz = (score: number, earned: number, ids: string[]) => {
    const nextAnswered = [...new Set([...answered, ...ids])];
    setAnswered(nextAnswered);
    setScores([...scores, score]);
    setXp(xp + earned);
    localStorage.setItem("java-answered", JSON.stringify(nextAnswered));
    localStorage.setItem("java-scores", JSON.stringify([...scores, score]));
    localStorage.setItem("java-xp", String(xp + earned));
    // Answering a quiz keeps the weekly streak alive.
    recordWeeklyActivity();
  };
  const updateCourses = (courses: string[]) => {
    const next = [...new Set(courses)];
    setSelectedCourses(next);
    localStorage.setItem("study-courses", JSON.stringify(next));
  };
  if (loading) return <LoadingScreen />;
  return (
    <div className={dark ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Auth onAuth={authenticate} />
              )
            }
          />
          <Route
            path="/terms"
            element={<LegalPage title="Terms and Conditions" />}
          />
          <Route
            path="/privacy"
            element={<LegalPage title="Privacy Notice" />}
          />
          <Route path="/about" element={<LegalPage title="About StudyLab" />} />
          <Route
            path="/course-selection"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <CourseSelectionPage
                    selectedCourses={selectedCourses}
                    onChange={updateCourses}
                    degree={user?.degree || ""}
                    onDegreeChange={(degree) => {
                      if (!user) return;
                      const nextUser = { ...user, degree };
                      setUser(nextUser);
                      localStorage.setItem(
                        "java-user",
                        JSON.stringify(nextUser),
                      );
                    }}
                  />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Dashboard
                    user={user}
                    answered={answered}
                    scores={scores}
                    selectedCourses={selectedCourses}
                  />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/modules"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Modules
                    answered={answered}
                    selectedCourses={selectedCourses}
                  />
                </Shell>
              </Guard>
            }
          />
          <Route path="/topics" element={<Navigate to="/modules" replace />} />
          <Route
            path="/practice"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Practice />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/test"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <TimedTestPage questions={allQuestions} />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/notes"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <NotesPage />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/quiz/:topic"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Quiz onFinish={recordQuiz} />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/progress"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Progress answered={answered} scores={scores} xp={xp} />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/results"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Results />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Leaderboard user={user} xp={xp} scores={scores} />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                >
                  <Profile
                    user={user}
                    onUpdate={(nextUser) => setUser(nextUser)}
                    onLogout={logout}
                  />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="/settings"
            element={
              <Guard user={user}>
                <Shell user={user}>
                  <Settings
                    dark={dark}
                    toggleTheme={() => {
                      const next = !dark;
                      setDark(next);
                      localStorage.setItem(
                        "java-theme",
                        next ? "dark" : "light",
                      );
                    }}
                  />
                </Shell>
              </Guard>
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function LoadingScreen() {
  // Logo, progress bar and credit line shown while the app boots.
  return (
    <main className="loading-screen">
      <img src={ctTechLogo} alt="CT TECH logo" />
      <div
        className="loading-bar"
        role="progressbar"
        aria-label="Loading StudyLab"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i />
      </div>
      <div className="loading-credit">
        Created by <strong>CT TECH</strong>
      </div>
    </main>
  );
}

function Guard({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

const OTHER_DEGREE = "Other";

function Auth({ onAuth }: { onAuth: (user: User, token: string) => void }) {
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [customDegree, setCustomDegree] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const usingOtherDegree = degree === OTHER_DEGREE;
  const finalDegree = usingOtherDegree ? customDegree.trim() : degree;

  // Send a verification code, then move to the code-entry step.
  const sendCode = async () => {
    const check = checkStudentEmail(email);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    if (!finalDegree) {
      setError("Please choose or enter your degree.");
      return;
    }
    setError("");
    setSending(true);
    const code = generateVerificationCode();
    setSentCode(code);
    const result = await requestVerificationCode(
      email.trim().toLowerCase(),
      code,
    );
    setNotice(result.message);
    savePendingVerification({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      university: university.trim(),
      degree: finalDegree,
      customDegree: usingOtherDegree ? customDegree.trim() : undefined,
      code,
      sentAt: Date.now(),
    });
    setSending(false);
    setStep("verify");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!register) {
      // Sign in: verify the address is allowed, then authenticate.
      const check = checkStudentEmail(email);
      if (!check.ok) {
        setError(check.reason);
        return;
      }
      try {
        const result = await api<{ user: User; token: string }>(
          "/api/auth/login",
          { method: "POST", body: JSON.stringify({ email, password }) },
        );
        onAuth(result.user, result.token);
        navigate("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to sign in");
      }
      return;
    }
    if (!termsAccepted) {
      setError(
        "Please accept the Terms and Conditions and Privacy Notice to continue.",
      );
      return;
    }
    await sendCode();
  };

  // Compare the typed code with the one sent to the student's email.
  const verifyAndRegister = async () => {
    setError("");
    const pending = readPendingVerification();
    const expected = pending?.code || sentCode;
    if (!expected) {
      setError("Request a new verification code.");
      return;
    }
    if (Date.now() - (pending?.sentAt || 0) > CODE_TTL_MS) {
      setError("That code expired. Request a new one.");
      return;
    }
    if (codeInput.trim() !== expected) {
      setError(
        "That verification code is incorrect. Check your email and try again.",
      );
      return;
    }
    try {
      await api<{ verified: boolean }>("/api/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({
          email: pending?.email || email,
          code: codeInput.trim(),
        }),
      }).catch(() => ({ verified: true }));
      const result = await api<{ user: User; token: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: pending?.name || name,
            email: pending?.email || email,
            password: pending?.password || password,
            university: pending?.university || university,
            degree: pending?.degree || finalDegree,
          }),
        },
      );
      clearPendingVerification();
      onAuth(result.user, result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create the account",
      );
    }
  };

  const restart = () => {
    clearPendingVerification();
    setStep("credentials");
    setCodeInput("");
    setNotice("");
    setError("");
  };

  return (
    <main className="auth">
      <Link className="logo" to="/">
        <span>⌘</span> Study<span>Lab</span>
      </Link>
      <div className="auth-card">
        {step === "verify" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verifyAndRegister();
            }}
          >
            <div className="eyebrow">VERIFY YOUR STUDENT EMAIL</div>
            <h1>Enter your code.</h1>
            <p>
              We sent a 6-digit verification code to <b>{email}</b>. Paste it
              below to confirm the address is yours.
            </p>
            {notice && <div className="auth-notice">{notice}</div>}
            <div className="auth-demo-code">
              <span>YOUR VERIFICATION CODE</span>
              <b>{sentCode}</b>
              <small>
                No mail server is connected yet, so your code appears here. Once
                email delivery is switched on it will arrive in your inbox.
              </small>
            </div>
            <label>
              Verification code
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={codeInput}
                onChange={(event) =>
                  setCodeInput(event.target.value.replace(/\D/g, ""))
                }
                placeholder="6-digit code"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="button full" type="submit">
              Verify & create account →
            </button>
            <div className="verify-actions">
              <button type="button" className="text-link" onClick={restart}>
                Use a different email
              </button>
              <button
                type="button"
                className="text-link"
                disabled={sending}
                onClick={() => void sendCode()}
              >
                {sending ? "Sending…" : "Resend code"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="eyebrow">
              {register ? "START YOUR STREAK" : "WELCOME BACK"}
            </div>
            <h1>{register ? "Build your study path." : "Back to the lab."}</h1>
            <p>
              {register
                ? "Sign up with your student email. We will email you a code to verify it."
                : "Sign in with your verified student email to keep your progress moving."}
            </p>
            <form onSubmit={submit}>
              {register && (
                <>
                  <label>
                    Name
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label>
                    University or college
                    <input
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    />
                  </label>
                  <label>
                    Degree or programme
                    <select
                      required
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    >
                      <option value="">Select your degree</option>
                      {degreeCatalog.map((option) => (
                        <option key={option.name}>{option.name}</option>
                      ))}
                      <option value={OTHER_DEGREE}>Other degree</option>
                    </select>
                  </label>
                  {usingOtherDegree && (
                    <label className="custom-degree-field">
                      Please specify your degree
                      <input
                        required
                        value={customDegree}
                        onChange={(e) => setCustomDegree(e.target.value)}
                        placeholder="e.g. Actuarial Science"
                      />
                    </label>
                  )}
                </>
              )}
              <label>
                {register ? "Student email" : "Email"}
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    register
                      ? "you@student.university.edu"
                      : "you@student.university.edu"
                  }
                />
                {register && (
                  <small className="field-hint">
                    Use your school or university email, not a personal one.
                  </small>
                )}
              </label>
              <label>
                Password
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {register && (
                <label className="terms-check">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  I accept the <Link to="/terms">Terms and Conditions</Link> and{" "}
                  <Link to="/privacy">Privacy Notice</Link>.
                </label>
              )}
              {error && <div className="error">{error}</div>}
              <button className="button full" disabled={sending}>
                {register
                  ? sending
                    ? "Sending code…"
                    : "Send verification code →"
                  : "Sign in →"}
              </button>
            </form>
            <p className="switch">
              {register ? "Already have an account?" : "New to StudyLab?"}{" "}
              <button
                onClick={() => {
                  setRegister(!register);
                  setError("");
                }}
              >
                {register ? "Sign in" : "Create one"}
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function LegalPage({ title }: { title: string }) {
  const isAbout = title.toLowerCase().includes("about");
  const age = founderAge();
  return (
    <main className="auth">
      <div className="auth-card legal-page">
        <div className="eyebrow">
          {isAbout ? "ABOUT STUDYLAB" : "STUDYLAB LEGAL"}
        </div>
        <h1>{title}</h1>
        {isAbout ? (
          <>
            <p>
              StudyLab is a focused learning workspace built by CT TECH. It
              pairs plain-language notes with practice questions and tests drawn
              from those same notes, so students understand what they are doing
              rather than just memorising answers.
            </p>
            <h3>Who created StudyLab</h3>
            <p>
              I am {FOUNDER.name}, the founder of CT TECH. I am {age} years old
              and I study Computer Science and Mathematics at university. I
              built StudyLab to help students understand their work more deeply
              — especially in programming, where the gap between copying code
              and truly understanding it is where most people get stuck.
            </p>
            <p>
              The plan is simple: start with Java, teach it properly, and keep
              growing into more subjects over time.
            </p>
            <div className="about-facts">
              <span className="pill">CT TECH</span>
              <span className="pill">Computer Science and Mathematics</span>
              <span className="pill">Founder-led</span>
            </div>
          </>
        ) : (
          <>
            <p>
              StudyLab provides educational practice content for personal
              learning. You are responsible for checking answers and using the
              service lawfully.
            </p>
            <p>
              Do not submit confidential, copyrighted, or harmful material.
              Accounts must use accurate information and remain secure. We may
              store account details and learning activity to provide the
              service, as described in the Privacy Notice.
            </p>
            <p>
              This is a general product notice, not legal advice. Please have a
              qualified lawyer review these terms for your jurisdiction before
              relying on them for legal protection.
            </p>
          </>
        )}
        <Link className="button" to="/auth">
          Return to sign in
        </Link>
      </div>
    </main>
  );
}

function Shell({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  // On desktop the sidebar starts expanded. On a phone it starts closed so the
  // content gets the full width.
  const [expanded, setExpanded] = useState(
    () => typeof window === "undefined" || window.innerWidth > 650,
  );
  const [width, setWidth] = useState(240);
  const dragging = useRef(false);
  // "My account" is intentionally not listed here: it already lives in the
  // bottom-of-sidebar profile card.
  const links = [
    ["/dashboard", "⌂", "Dashboard"],
    ["/modules", "◈", "Modules"],
    ["/practice", "⌘", "Practice lab"],
    ["/test", "◷", "Timed test"],
    ["/notes", "✎", "Notes & tips"],
    ["/progress", "◔", "My progress"],
    ["/leaderboard", "♛", "Leaderboard"],
    ["/settings", "⚙", "Settings"],
  ];
  // Recompute the streak whenever the route changes (quiz/test completions land
  // on a new page), without a setState-in-effect round trip.
  const { streak, bestStreak } = useMemo(() => {
    void location.pathname;
    return { streak: getWeekStreak(), bestStreak: getBestWeekStreak() };
  }, [location.pathname]);
  const canGoBack = location.pathname !== "/dashboard";
  // The burger lives inside the sidebar and simply flips it open/closed.
  const toggleSidebar = () => setExpanded((value) => !value);
  // On a phone, always close the drawer after choosing a link.
  const closeOnMobile = () => {
    if (window.innerWidth <= 650) setExpanded(false);
  };
  const startResize = (event: React.PointerEvent) => {
    event.preventDefault();
    dragging.current = true;
    const onMove = (moveEvent: PointerEvent) => {
      if (!dragging.current) return;
      const next = Math.min(420, Math.max(180, moveEvent.clientX));
      setWidth(next);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const shellStyle = {
    "--sidebar-width": `${width}px`,
  } as React.CSSProperties;
  const shellClasses = ["shell", expanded ? "menu-open" : "sidebar-collapsed"]
    .filter(Boolean)
    .join(" ");
  const sidebarClass = ["sidebar", expanded ? "open" : "closed"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={shellClasses} style={shellStyle}>
      <aside className={sidebarClass}>
        <div className="side-logo">
          <button
            className="hamburger sidebar-burger"
            aria-label={expanded ? "Close menu" : "Open menu"}
            aria-expanded={expanded}
            title="Toggle menu"
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>
          <Link className="logo" to="/dashboard">
            <span>⌘</span> Study<span>Lab</span>
          </Link>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {links.map(([to, icon, label]) => (
            <Link
              className={location.pathname === to ? "active" : ""}
              to={to}
              onClick={closeOnMobile}
              key={to}
            >
              <b>{icon}</b>
              {label}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="streak">
            <span>♨</span>
            <div>
              <b>
                {streak} week{streak === 1 ? "" : "s"} streak
              </b>
              <small>
                {hasActivityThisWeek()
                  ? `Best: ${bestStreak} weeks`
                  : "Answer a quiz to continue"}
              </small>
            </div>
          </div>
          <Link className="profile-mini" to="/profile">
            {user?.picture ? (
              <img src={user.picture} alt="" />
            ) : (
              <i>{user?.name[0]}</i>
            )}
            <span>
              <b>{user?.name}</b>
              <small>Student</small>
            </span>
          </Link>
        </div>
        <div
          className="sidebar-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={startResize}
        />
      </aside>
      <div className="main">
        <header>
          <button
            className="hamburger header-burger"
            aria-label={expanded ? "Close menu" : "Open menu"}
            aria-expanded={expanded}
            title="Toggle menu"
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>
          {canGoBack && (
            <button
              className="back-button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Go back"
            >
              ← <span>Back</span>
            </button>
          )}
          <span className="breadcrumb">
            StudyLab <b>/</b> {location.pathname.slice(1) || "dashboard"}
          </span>
          <div className="header-actions">
            <span className="xp-chip">✦ {user ? "Level 4" : ""}</span>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  answered,
  scores,
  selectedCourses,
}: {
  user: User | null;
  answered: string[];
  scores: number[];
  selectedCourses: string[];
}) {
  const navigate = useNavigate();
  // Stats shown here are deliberately different from the ones on My Progress.
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const testsTaken = (() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("study-test-scores") || "[]",
        ) as number[]
      ).length;
    } catch {
      return 0;
    }
  })();
  const testsPassed = (() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("study-test-scores") || "[]",
        ) as number[]
      ).filter((value) => value >= 70).length;
    } catch {
      return 0;
    }
  })();
  const subtopicsCovered = topics.filter((topic) =>
    javaQuestionBank.some((q) => q.topic === topic && answered.includes(q.id)),
  ).length;
  const [pick, setPick] = useState<string>("random");
  const startQuiz = () => {
    const topic =
      pick === "random"
        ? topics[Math.floor(Math.random() * topics.length)]
        : pick;
    navigate(`/quiz/${encodeURIComponent(topic)}`);
  };
  return (
    <>
      <div className="title-row dashboard-hero">
        <div>
          <div className="eyebrow">YOUR STUDY WORKSPACE</div>
          <h1>
            Welcome, {user?.name || "student"} <em>✦</em>
          </h1>
          <p>Here is how your Java learning is going.</p>
        </div>
      </div>
      {!selectedCourses.length && (
        <section className="panel dashboard-course-prompt">
          <span className="dashboard-course-icon">✦</span>
          <div>
            <b>Add the courses you are studying</b>
            <p>
              Pick your modules so StudyLab can tailor the dashboard to your
              programme.
            </p>
          </div>
          <Link className="button" to="/course-selection">
            Choose courses <span>→</span>
          </Link>
        </section>
      )}
      <section className="panel new-quiz-panel">
        <div className="new-quiz-copy">
          <span className="eyebrow">READY TO PRACTISE</span>
          <h2>Start a new quiz</h2>
          <p>
            Pick a Java sub-topic or let StudyLab choose a random one for you.
          </p>
        </div>
        <div className="new-quiz-controls">
          <select
            className="new-quiz-select"
            value={pick}
            onChange={(event) => setPick(event.target.value)}
            aria-label="Choose a Java sub-topic"
          >
            <option value="random">Random sub-topic</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <button className="button" onClick={startQuiz}>
            Start quiz <span>→</span>
          </button>
        </div>
      </section>
      <div className="stats">
        <Stat
          icon="◈"
          label="Sub-topics covered"
          value={`${subtopicsCovered}/${topics.length}`}
          detail="Java sub-topics"
          color="purple"
        />
        <Stat
          icon="◎"
          label="Best score"
          value={`${bestScore}%`}
          detail={scores.length ? `${scores.length} quizzes` : "No quizzes yet"}
          color="green"
        />
        <Stat
          icon="◷"
          label="Tests taken"
          value={String(testsTaken)}
          detail="20-question tests"
          color="blue"
        />
        <Stat
          icon="✦"
          label="Tests passed"
          value={String(testsPassed)}
          detail="70% or higher"
          color="orange"
        />
      </div>
    </>
  );
}
function Stat({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="stat">
      <span className={`stat-icon ${color}`}>{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
      <em>{detail}</em>
    </div>
  );
}

function Modules({
  answered,
  selectedCourses,
}: {
  answered: string[];
  selectedCourses: string[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedModule = searchParams.get("module");
  const [query, setQuery] = useState("");
  const [request, setRequest] = useState("");
  const [requested, setRequested] = useState(false);
  if (selectedModule === "java")
    return (
      <JavaTopics answered={answered} onBack={() => setSearchParams({})} />
    );
  if (selectedModule === "mechanics")
    return <PhysicsTopics onBack={() => setSearchParams({})} />;
  if (selectedModule === "calculus")
    return <CalculusTopics onBack={() => setSearchParams({})} />;
  // Only modules flagged `visible` are shown. The others stay defined in the
  // catalog (nothing is deleted) so they can be switched on again later.
  const filtered = moduleCatalog.filter(
    (module) =>
      module.visible &&
      `${module.name} ${module.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const categories = [...new Set(filtered.map((module) => module.category))];
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR MODULES</div>
          <h1>Choose a module.</h1>
          <p>
            Browse by category, or search for the subject you want to study.
          </p>
        </div>
        <span className="pill">
          {
            moduleCatalog.filter((module) => module.visible && module.active)
              .length
          }{" "}
          ACTIVE ·{" "}
          {
            moduleCatalog.filter((module) => module.visible && !module.active)
              .length
          }{" "}
          COMING SOON
        </span>
      </div>
      <div className="search module-search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules, coding, mathematics..."
        />
      </div>
      {categories.map((category) => (
        <section className="module-category" key={category}>
          <div className="module-label">
            <span className="eyebrow">{category}</span>
            <h2>
              {category === "Coding"
                ? "Coding modules"
                : category === "Mathematics"
                  ? "Mathematics modules"
                  : `${category} modules`}
            </h2>
          </div>
          <div className="module-cards">
            {filtered
              .filter((module) => module.category === category)
              .map((module) =>
                module.active ? (
                  <Link
                    className="module-card panel"
                    to={`/modules?module=${module.name.toLowerCase()}`}
                    key={module.name}
                  >
                    <div className="module-card-icon">{module.icon}</div>
                    <div>
                      <span className="eyebrow">ACTIVE MODULE</span>
                      <h2>{module.name}</h2>
                      <p>{module.description}</p>
                      <span className="text-link">Open module →</span>
                    </div>
                  </Link>
                ) : (
                  <div className="module-placeholder panel" key={module.name}>
                    <div className="module-placeholder-icon">{module.icon}</div>
                    <div>
                      <span className="eyebrow">COMING SOON</span>
                      <h2>{module.name}</h2>
                      <p>{module.description}</p>
                    </div>
                    <span className="pill">NOT AVAILABLE YET</span>
                  </div>
                ),
              )}
          </div>
        </section>
      ))}
      {!filtered.length && (
        <div className="panel module-request">
          <h2>Can't find your module?</h2>
          <p>Request it and we will consider adding it to StudyLab.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (request.trim()) setRequested(true);
            }}
          >
            <input
              required
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="Enter module name"
            />
            <button className="button">
              {requested ? "Request sent ✓" : "Request module"}
            </button>
          </form>
        </div>
      )}
      <div className="module-selection-hint">
        <span>✦</span>
        <p>
          Studying something else?{" "}
          <Link to="/course-selection">Add more modules to your workspace</Link>
          . Your {selectedCourses.length} selected course
          {selectedCourses.length === 1 ? "" : "s"} stay in one place.
        </p>
      </div>
    </>
  );
}
function JavaTopics({
  answered,
  onBack,
}: {
  answered: string[];
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const visible = topics
    .map((topic, i) => ({ topic, i }))
    .filter(({ topic }) => topic.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">JAVA MODULE</div>
          <h1>Choose a topic.</h1>
          <p>Build your Java skills one focused topic at a time.</p>
        </div>
        <button className="button secondary" onClick={onBack}>
          ← All modules
        </button>
      </div>
      <div className="search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Java topics..."
        />
      </div>
      <div className="module-label">
        <span className="eyebrow">MODULE 01</span>
        <h2>Java topics</h2>
      </div>
      <div className="topic-grid">
        {visible.map(({ topic, i }) => (
          <article className="topic-card" key={topic}>
            <div className={`topic-icon t${i}`}>{topicIcons[i]}</div>
            <div className="topic-card-head">
              <span className="eyebrow">
                JAVA TOPIC {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {answered.filter((id) => id.startsWith(`${i}-`)).length}/24
              </span>
            </div>
            <h2>{topic}</h2>
            <p>{topicDescriptions[i]}</p>
            <div className="topic-card-foot">
              <div className="tiny-bar">
                <i
                  style={{
                    width: `${(answered.filter((id) => id.startsWith(`${i}-`)).length / 24) * 100}%`,
                  }}
                />
              </div>
              <Link
                to={`/quiz/${topic}`}
                onClick={(event) => event.stopPropagation()}
              >
                Practice →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function PhysicsTopics({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const visible = physicsTopics
    .map((topic, index) => ({ topic, index }))
    .filter(({ topic }) => topic.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">PHYSICS CATEGORY · MECHANICS MODULE</div>
          <h1>Explore mechanics.</h1>
          <p>Build intuition with short explanations and practical problems.</p>
        </div>
        <button className="button secondary" onClick={onBack}>
          ← All modules
        </button>
      </div>
      <div className="search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Physics modules..."
        />
      </div>
      <div className="module-label">
        <span className="eyebrow">MODULE 02</span>
        <h2>Mechanics topics</h2>
      </div>
      <div className="topic-grid">
        {visible.map(({ topic, index }) => (
          <article className="topic-card" key={topic}>
            <div className={`topic-icon t${index}`}>
              {physicsTopicIcons[index]}
            </div>
            <div className="topic-card-head">
              <span className="eyebrow">
                MECHANICS TOPIC {String(index + 1).padStart(2, "0")}
              </span>
              <span>3 questions</span>
            </div>
            <h2>{topic}</h2>
            <p>{physicsTopicDescriptions[index]}</p>
            <div className="topic-card-foot">
              <div className="tiny-bar">
                <i style={{ width: "0%" }} />
              </div>
              <Link to={`/quiz/${topic}`}>Practice →</Link>
            </div>
          </article>
        ))}
      </div>
      <div className="physics-note panel">
        <span className="course-icon">⚙</span>
        <div>
          <strong>Mechanics is ready to explore</strong>
          <p>
            Review motion, forces, energy, levers, pulleys, and mechanical
            advantage in one focused module.
          </p>
        </div>
        <Link
          className="text-link"
          to="/notes?category=Physics&module=Mechanics"
        >
          Read tips →
        </Link>
      </div>
    </>
  );
}

function CalculusTopics({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [revealedExercises, setRevealedExercises] = useState<number[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const visible = calculusTopics
    .map((topic, index) => ({ topic, index }))
    .filter(({ topic }) => topic.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">MAT1141 CALCULUS MODULE</div>
          <h1>Master calculus.</h1>
          <p>
            Follow the complete sequence from the supplied MAT1141 notes, from
            functions and limits through differentiation and applications.
          </p>
        </div>
        <button className="button secondary" onClick={onBack}>
          ← All modules
        </button>
      </div>
      <div className="search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search calculus topics..."
        />
      </div>
      <div className="module-label">
        <span className="eyebrow">MODULE 03 · MAT1141</span>
        <h2>Calculus topics</h2>
      </div>
      <section className="panel calculus-equations">
        <div className="panel-head">
          <div>
            <span className="eyebrow">FORMULA REFERENCE</span>
            <h2>Essential calculus equations</h2>
            <p>
              Use these formulas alongside the MAT1141 notes. Check the
              conditions and domain before applying a shortcut.
            </p>
          </div>
        </div>
        <div className="equation-grid">
          {calculusEquations.map(([name, equation]) => (
            <article className="equation-card" key={name}>
              <span className="eyebrow">{name}</span>
              <code>{equation}</code>
            </article>
          ))}
        </div>
      </section>
      <div className="topic-grid">
        {visible.map(({ topic, index }) => (
          <article
            className={
              selectedTopic === topic ? "topic-card selected" : "topic-card"
            }
            key={topic}
            onClick={() =>
              setSelectedTopic((current) => (current === topic ? null : topic))
            }
          >
            <div className={`topic-icon t${index % 6}`}>
              {calculusTopicIcons[index]}
            </div>
            <div className="topic-card-head">
              <span className="eyebrow">
                CALCULUS TOPIC {String(index + 1).padStart(2, "0")}
              </span>
              <span>24 questions</span>
            </div>
            <h2>{topic}</h2>
            <p>{calculusTopicDescriptions[index]}</p>
            <div className="topic-card-foot">
              <div className="tiny-bar">
                <i style={{ width: "0%" }} />
              </div>
              <Link to={`/quiz/${topic}`}>Practice →</Link>
            </div>
            {selectedTopic === topic && (
              <div className="topic-exercises">
                <span className="eyebrow">
                  TOPIC EXERCISES · TAP TO COLLAPSE
                </span>
                {calculusExercises
                  .filter((exercise) => exercise.topic === topic)
                  .map((exercise) => {
                    const exerciseIndex = calculusExercises.indexOf(exercise);
                    const revealed = revealedExercises.includes(exerciseIndex);
                    return (
                      <div className="topic-exercise" key={exercise.prompt}>
                        <p>{exercise.prompt}</p>
                        <button
                          className="text-link"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRevealedExercises((current) =>
                              revealed
                                ? current.filter(
                                    (item) => item !== exerciseIndex,
                                  )
                                : [...current, exerciseIndex],
                            );
                          }}
                        >
                          {revealed ? "Hide answer" : "Reveal answer"}
                        </button>
                        {revealed && (
                          <div className="exercise-answer">
                            <strong>Answer:</strong> {exercise.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="physics-note panel">
        <span className="course-icon">∫</span>
        <p>
          <strong>Use the notes as your roadmap.</strong> Work from definitions
          to examples, keep your domain restrictions visible, and check every
          derivative or limit against the conditions in the MAT1141 material.
        </p>
      </div>
    </>
  );
}

function Quiz({
  onFinish,
}: {
  onFinish: (score: number, xp: number, ids: string[]) => void;
}) {
  const { topic } = useParams();
  const [difficulty, setDifficulty] = useState<Difficulty | "Mixed">("Mixed");
  const note = topic ? findNote(topic) : undefined;
  const pool = useMemo(() => {
    // Java sub-topics use the 100-question bank so practice lines up with the
    // notes. Other subjects (Physics, Calculus) fall back to the shared list.
    const source = javaQuestionBank.some((q) => q.topic === topic)
      ? javaQuestionBank
      : allQuestions;
    return source.filter(
      (q) =>
        q.topic === topic &&
        q.options.length > 0 &&
        (difficulty === "Mixed" || q.difficulty === difficulty),
    );
  }, [topic, difficulty]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [challengeCode, setChallengeCode] = useState("");
  const [hardSeconds, setHardSeconds] = useState(600);
  // Which option the student picked for each question id, so the final review
  // can show their answer next to the correct one.
  const [pickByQuestion, setPickByQuestion] = useState<Record<string, number>>(
    {},
  );
  const [reviewMode, setReviewMode] = useState(false);
  const hard = difficulty === "Hard";
  useEffect(() => {
    if (!hard || submitted || hardSeconds <= 0) return;
    const timer = window.setInterval(
      () => setHardSeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [hard, submitted, hardSeconds]);
  const q = pool[index] || questions[0];
  // A hard question is shown as the legacy code project only when it has no
  // answer options. Bank hard questions are multiple-choice and render normally.
  const hardProject =
    hard && q.options.length === 0 && q.kind !== "written answer";
  const writtenHard = hard && q.kind === "written answer";
  const written = !hard && q.difficulty === "Medium";
  const multipleChoice =
    !written && !writtenHard && !hardProject && q.options.length > 0;
  const project = hardChallenges.find(
    (challenge) => challenge.topic === topic,
  ) || {
    title: `${topic} quick model`,
    prompt: q.prompt,
    requirement:
      "Use one focused formula or relationship, two or three inputs, and a clearly labelled result.",
    deliverables: [
      "Read the required values",
      "Calculate one result with units",
      "Print a clear answer",
    ],
  };
  const submit = () => {
    if (writtenHard && !writtenAnswer.trim()) return;
    if (hardProject && !challengeCode.trim()) return;
    if (written && !writtenAnswer.trim()) return;
    if (multipleChoice && selected === null) return;
    if (submitted) {
      const correct = writtenHard
        ? writtenAnswer
            .trim()
            .toLowerCase()
            .includes(q.textAnswer?.toLowerCase() || "show")
        : hardProject
          ? challengeCode.includes("class") && challengeCode.includes("main")
          : written
            ? writtenAnswer.trim().toLowerCase().replace(/\s+/g, "") ===
              q.textAnswer?.toLowerCase().replace(/\s+/g, "")
            : selected === q.answer;
      const next = [...results, correct];
      setResults(next);
      if (multipleChoice && selected !== null) {
        setPickByQuestion((current) => ({ ...current, [q.id]: selected }));
      }
      setSelected(null);
      setWrittenAnswer("");
      setChallengeCode("");
      setSubmitted(false);
      if (index === pool.length - 1) {
        onFinish(
          Math.round((next.filter(Boolean).length / next.length) * 100),
          25 + next.filter(Boolean).length * 10,
          pool.map((item) => item.id),
        );
        setReviewMode(true);
      } else setIndex(index + 1);
    } else setSubmitted(true);
  };
  const isCorrect = writtenHard
    ? writtenAnswer
        .trim()
        .toLowerCase()
        .includes(q.textAnswer?.toLowerCase() || "show")
    : hardProject
      ? challengeCode.includes("class") && challengeCode.includes("main")
      : written
        ? writtenAnswer.trim().toLowerCase().replace(/\s+/g, "") ===
          q.textAnswer?.toLowerCase().replace(/\s+/g, "")
        : selected === q.answer;

  // -----------------------------------------------------------------------
  // Final review — shown once every question in this quiz has been attempted.
  // -----------------------------------------------------------------------
  if (reviewMode) {
    const correctCount = results.filter(Boolean).length;
    const score = results.length
      ? Math.round((correctCount / results.length) * 100)
      : 0;
    return (
      <div className="timed-test test-review">
        <div className="review-hero panel">
          <div className="eyebrow">
            {(topic || "Java").toUpperCase()} · REVIEW
          </div>
          <h1>{score >= 70 ? "Strong work." : "Let's fix the gaps."}</h1>
          <div className="review-score">
            <b>{score}%</b>
            <span>
              {correctCount} of {results.length} correct
            </span>
          </div>
          <p>
            {correctCount === results.length
              ? "Every answer was correct. Try another difficulty for a fresh set of questions."
              : `You missed ${results.length - correctCount} question${results.length - correctCount === 1 ? "" : "s"}. Each one is explained below so you can see exactly why the right answer is right.`}
          </p>
          <div className="review-actions">
            <Link
              className="button"
              to={`/quiz/${encodeURIComponent(topic ?? "")}`}
            >
              Retry this quiz <span>→</span>
            </Link>
            {note && (
              <Link
                className="button secondary"
                to={`/notes?category=Java&module=${encodeURIComponent(note.subtopic)}`}
              >
                Re-read the notes
              </Link>
            )}
          </div>
        </div>

        <div className="review-list">
          {pool.map((question, questionIndex) => {
            const chosen = pickByQuestion[question.id];
            const wasCorrect = chosen === question.answer;
            const questionNote = findNote(question.topic);
            return (
              <section
                className={
                  wasCorrect
                    ? "panel review-card correct"
                    : "panel review-card wrong"
                }
                key={question.id}
              >
                <div className="review-card-head">
                  <span className="review-index">Q{questionIndex + 1}</span>
                  <span
                    className={`difficulty ${question.difficulty.toLowerCase()}`}
                  >
                    {question.difficulty}
                  </span>
                  <span
                    className={
                      wasCorrect ? "review-badge ok" : "review-badge bad"
                    }
                  >
                    {wasCorrect ? "Correct ✓" : "Incorrect ✗"}
                  </span>
                </div>
                <h2>{question.prompt}</h2>
                {question.code && (
                  <pre className="question-code">{question.code}</pre>
                )}
                <div className="review-options">
                  {question.options.map((option, optionIndex) => {
                    const isAnswer = optionIndex === question.answer;
                    const isChosen = optionIndex === chosen;
                    const classes = ["review-option"];
                    if (isAnswer) classes.push("is-correct");
                    if (isChosen && !isAnswer) classes.push("is-wrong");
                    return (
                      <div className={classes.join(" ")} key={option}>
                        <span className="review-letter">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="review-option-text">{option}</span>
                        {isAnswer && <em>Correct answer</em>}
                        {isChosen && !isAnswer && <em>Your answer</em>}
                        {isChosen && isAnswer && <em>You chose this</em>}
                      </div>
                    );
                  })}
                </div>
                <div className="review-note">
                  <b>
                    {wasCorrect
                      ? "Why this is correct"
                      : chosen === undefined
                        ? "You skipped this question"
                        : `Why "${question.options[chosen]}" is not the answer`}
                  </b>
                  <span>{question.explanation}</span>
                </div>
                {questionNote && (
                  <Link
                    className="text-link review-note-link"
                    to={`/notes?category=Java&module=${encodeURIComponent(questionNote.subtopic)}`}
                  >
                    Re-read the {questionNote.subtopic} notes →
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quiz-header">
        <div>
          <Link to="/modules" className="back">
            ← Modules
          </Link>
          <div className="eyebrow">JAVA MODULE · QUIZ</div>
          <h1>{topic} practice</h1>
          {note && (
            <Link
              className="text-link quiz-note-link"
              to={`/notes?category=Java&module=${encodeURIComponent(note.subtopic)}`}
            >
              ← Read the {note.subtopic} notes first
            </Link>
          )}
        </div>
        <div className="score-box">
          <span>Score</span>
          <b>
            {results.filter(Boolean).length}/{results.length}
          </b>
        </div>
      </div>
      <div className="difficulty-tabs">
        {(["Mixed", "Easy", "Medium", "Hard"] as const).map((item) => (
          <button
            className={difficulty === item ? "active" : ""}
            onClick={() => {
              setDifficulty(item);
              setIndex(0);
              setResults([]);
              setSelected(null);
              setWrittenAnswer("");
              setSubmitted(false);
              setChallengeCode("");
              setHardSeconds(600);
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="quiz-progress">
        <span>
          Question {index + 1} of {pool.length}
        </span>
        <div className="progress-track">
          <i style={{ width: `${((index + 1) / pool.length) * 100}%` }} />
        </div>
      </div>
      <div className="quiz-layout">
        <main className="question-card panel">
          <div className="question-meta">
            <span className={`difficulty ${q.difficulty.toLowerCase()}`}>
              {q.difficulty}
            </span>
            <span>
              {hardProject ? "mini project" : q.kind.replace("-", " ")}
            </span>
            <span>
              {hardProject
                ? `${Math.floor(hardSeconds / 60)}:${String(hardSeconds % 60).padStart(2, "0")}`
                : "+40 XP"}
            </span>
          </div>
          <h2>{hardProject ? project?.prompt : q.prompt}</h2>
          {writtenHard ? (
            <textarea
              className="written-answer"
              disabled={submitted}
              value={writtenAnswer}
              onChange={(event) => setWrittenAnswer(event.target.value)}
              placeholder="Show your complete working here..."
            />
          ) : hardProject ? (
            <>
              <div className="project-brief">
                <strong>{project?.title}</strong>
                <p>{project?.requirement}</p>
                <ul>
                  {project?.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="challenge-instruction">
                This is a focused 10-minute build. Keep the scope small: one
                input flow, one calculation, and one useful result.
              </p>
              <textarea
                className="hard-editor"
                spellCheck={false}
                value={challengeCode}
                disabled={submitted}
                onChange={(event) => setChallengeCode(event.target.value)}
                placeholder="Write your complete Java solution here..."
              />
            </>
          ) : written ? (
            <textarea
              className="written-answer"
              disabled={submitted}
              value={writtenAnswer}
              onChange={(event) => setWrittenAnswer(event.target.value)}
              placeholder="Type your answer here..."
            />
          ) : (
            <>
              {q.code && <pre className="question-code">{q.code}</pre>}
              <div className="answers">
                {q.options.map((option, i) => (
                  <button
                    disabled={submitted}
                    className={selected === i ? "answer selected" : "answer"}
                    onClick={() => setSelected(i)}
                    key={option}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
          {submitted && (
            <div className={isCorrect ? "feedback good" : "feedback bad"}>
              <b>
                {writtenHard
                  ? isCorrect
                    ? "Working submitted"
                    : `Expected: ${q.textAnswer}`
                  : hardProject
                    ? "Project submitted"
                    : isCorrect
                      ? "Correct answer"
                      : `Correct answer: ${written ? q.textAnswer : q.options[q.answer]}`}
              </b>
              <span>
                {hardProject
                  ? "Your code was submitted. Make sure it satisfies every project requirement before moving on."
                  : q.explanation}
              </span>
            </div>
          )}
          <button
            className="button submit"
            disabled={
              writtenHard
                ? !writtenAnswer.trim()
                : hardProject
                  ? !challengeCode.trim()
                  : written
                    ? !writtenAnswer.trim()
                    : selected === null
            }
            onClick={submit}
          >
            {submitted
              ? index === pool.length - 1
                ? "Finish & see results"
                : "Next challenge"
              : hardProject || writtenHard
                ? "Submit project"
                : "Submit answer"}{" "}
            <span>→</span>
          </button>
        </main>
        <aside className="quiz-aside panel">
          {hardProject || writtenHard ? (
            <>
              <span className="eyebrow">HARD MODE</span>
              <h3>Build in 10 minutes.</h3>
              <p>
                Some hard questions are practical mini-projects. Read the brief,
                implement it from scratch, and submit a complete Java class.
              </p>
              <div className="quiz-rule">
                <b>⌘</b>
                <span>
                  <strong>Project brief</strong>
                  <small>
                    Requirements and deliverables are shown beside the editor
                  </small>
                </span>
              </div>
              <div className="quiz-rule">
                <b>✦</b>
                <span>
                  <strong>Earn 40 XP</strong>
                  <small>For every completed challenge</small>
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">STUDY LINK</span>
              <h3>Read the notes first.</h3>
              <p>
                These questions are written from the same notes as your study
                cards. If a question feels hard, the answer is in the notes —
                especially the “common traps” section.
              </p>
              {note && (
                <Link
                  className="button secondary mini quiz-aside-link"
                  to={`/notes?category=Java&module=${encodeURIComponent(note.subtopic)}`}
                >
                  Open {note.subtopic} notes <span>→</span>
                </Link>
              )}
              <div className="quiz-rule">
                <b>✦</b>
                <span>
                  <strong>Earn 40 XP</strong>
                  <small>For every correct answer</small>
                </span>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

const HELLO_WORLD_CODE =
  'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}';

function Practice() {
  const [code, setCode] = useState(HELLO_WORLD_CODE);
  const [output, setOutput] = useState(
    "Run your Java program to see real output.",
  );
  const [running, setRunning] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const runCode = async () => {
    setRunning(true);
    setOutput("Compiling Main.java...");
    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      setOutput(
        result.ok
          ? result.output || "(program produced no output)"
          : `Compilation/runtime error:\\n${result.error}`,
      );
    } catch {
      setOutput(
        "Could not reach the Java runner. Start the API with npm run dev.",
      );
    } finally {
      setRunning(false);
    }
  };
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">JAVA PRACTICE LAB</div>
          <h1>Practice lab.</h1>
          <p>Write real Java and run it. Your output comes live from javac.</p>
        </div>
        <Link className="button secondary" to="/notes">
          Read the notes first <span>→</span>
        </Link>
      </div>
      <>
        <div className="challenge-bar">
          <div>
            <span className="eyebrow">EXERCISE · +40 XP</span>
            <h2>Say hello in Java</h2>
            <p>
              Run the starter program so it prints <code>Hello, World!</code>.
            </p>
          </div>
          <button
            className="button mini"
            onClick={() => setChallengeDone(true)}
          >
            {challengeDone ? "Challenge complete ✓" : "Mark challenge complete"}
          </button>
        </div>
        <div className="editor-grid">
          <section className="editor panel">
            <div className="editor-head">
              <span>● ● ● &nbsp; Main.java</span>
              <div>
                <button onClick={() => setCode(HELLO_WORLD_CODE)}>Reset</button>
                <button className="run" disabled={running} onClick={runCode}>
                  {running ? "Compiling..." : "▶ Run Java"}
                </button>
              </div>
            </div>
            <textarea
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </section>
          <section className="output panel">
            <div className="output-head">
              OUTPUT <span>● {running ? "running" : "ready"}</span>
            </div>
            <pre>{output}</pre>
            <small>
              Output comes from javac and java on the server, including compiler
              errors.
            </small>
          </section>
        </div>
        <div className="mistake-row panel">
          <span className="history-check">◌</span>
          <div>
            <b>Practice mistakes</b>
            <p>Questions you miss are collected here for focused review.</p>
          </div>
          <Link to="/quiz/Java Basics">Review mistakes →</Link>
        </div>
      </>
    </>
  );
}

function Progress({
  answered,
  scores,
  xp,
}: {
  answered: string[];
  scores: number[];
  xp: number;
}) {
  // Real numbers derived from the student's own activity, not fixed values.
  const accuracy = scores.length
    ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
    : 0;
  const weekStreak = getWeekStreak();
  const bestStreak = getBestWeekStreak();
  const answeredThisWeek = hasActivityThisWeek();
  const bestScore = scores.length ? Math.max(...scores) : 0;

  // Per-sub-topic mastery: how many of each topic's questions have been answered.
  const topicMastery = topics.map((topic, index) => {
    const total = javaQuestionBank.filter((q) => q.topic === topic).length;
    const done = javaQuestionBank.filter(
      (q) => q.topic === topic && answered.includes(q.id),
    ).length;
    return {
      topic,
      index,
      total,
      done,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  });
  const weakest = [...topicMastery]
    .filter((item) => item.total > 0)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);
  const strongest = [...topicMastery]
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent)[0];

  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR STUDY DATA</div>
          <h1>My progress.</h1>
          <p>
            Everything you have done so far, and what to do next — all in one
            place.
          </p>
        </div>
        <Link className="button" to="/practice">
          Keep practising <span>→</span>
        </Link>
      </div>

      <div className="stats">
        <Stat
          icon="◎"
          label="Accuracy"
          value={`${accuracy}%`}
          detail={`Best: ${bestScore}%`}
          color="green"
        />
        <Stat
          icon="◈"
          label="Questions answered"
          value={String(answered.length)}
          detail={`of ${javaQuestionBank.length} in Java`}
          color="purple"
        />
        <Stat
          icon="✦"
          label="Total XP"
          value={xp.toLocaleString()}
          detail="Points earned"
          color="orange"
        />
        <Stat
          icon="♨"
          label="Week streak"
          value={`${weekStreak}`}
          detail={
            answeredThisWeek
              ? `Best: ${bestStreak} weeks`
              : "Answer a quiz this week"
          }
          color="blue"
        />
      </div>

      <section className="panel progress-cta-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">JUMP BACK IN</span>
            <h2>Continue where it matters</h2>
          </div>
        </div>
        <div className="progress-link-grid">
          <Link className="progress-link" to="/notes">
            <span>✎</span>
            <div>
              <b>Study the notes</b>
              <small>Re-learn a weak sub-topic</small>
            </div>
            <em>→</em>
          </Link>
          <Link
            className="progress-link"
            to={weakest[0] ? `/quiz/${weakest[0].topic}` : "/modules"}
          >
            <span>⌘</span>
            <div>
              <b>
                {weakest[0]
                  ? `Fix ${weakest[0].topic}`
                  : "Start a practice quiz"}
              </b>
              <small>Your weakest sub-topic</small>
            </div>
            <em>→</em>
          </Link>
          <Link className="progress-link" to="/test">
            <span>◷</span>
            <div>
              <b>Take a 20-question test</b>
              <small>Random set, then full review</small>
            </div>
            <em>→</em>
          </Link>
          <Link className="progress-link" to="/leaderboard">
            <span>♛</span>
            <div>
              <b>See the leaderboard</b>
              <small>How you compare</small>
            </div>
            <em>→</em>
          </Link>
        </div>
      </section>

      <div className="progress-columns">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">SUB-TOPIC MASTERY</span>
              <h2>Java, topic by topic</h2>
            </div>
            <span className="pill">{answered.length} answered</span>
          </div>
          {strongest && (
            <div className="mastery-highlight">
              <b>Strongest: {strongest.topic}</b>
              <small>{strongest.percent}% covered</small>
            </div>
          )}
          {topicMastery.map((item) => (
            <div className="mastery" key={item.topic}>
              <div>
                <b>{item.topic}</b>
                <span className="mastery-count">
                  {item.done}/{item.total}
                </span>
              </div>
              <div className="tiny-bar">
                <i
                  className={item.percent >= 50 ? "good" : ""}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <Link className="mastery-link" to={`/quiz/${item.topic}`}>
                Practice →
              </Link>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">WEAK SPOTS</span>
              <h2>What to fix next</h2>
            </div>
          </div>
          {weakest.length ? (
            weakest.map((item) => (
              <div className="result-line" key={item.topic}>
                <span>◌</span>
                <div>
                  <b>{item.topic}</b>
                  <small>{100 - item.percent}% left to cover</small>
                </div>
                <Link
                  to={`/notes?category=Java&module=${encodeURIComponent(item.topic)}`}
                >
                  Notes →
                </Link>
              </div>
            ))
          ) : (
            <div className="empty">
              Answer some questions and your weak spots will appear here.
            </div>
          )}
          <div className="panel-head history-head">
            <div>
              <span className="eyebrow">RECENT RESULTS</span>
              <h2>Quiz history</h2>
            </div>
          </div>
          {scores.length ? (
            scores
              .slice(-5)
              .reverse()
              .map((score, i) => (
                <div className="result-line" key={`${score}-${i}`}>
                  <span>{score >= 70 ? "✓" : "◌"}</span>
                  <div>
                    <b>Java checkpoint</b>
                    <small>Completed recently</small>
                  </div>
                  <strong>{score}%</strong>
                </div>
              ))
          ) : (
            <div className="empty">
              Finish your first quiz to see results here.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function Results() {
  const location = useLocation();
  const result = (location.state || {}) as { score?: number; total?: number };
  const score = result.score || 0;
  const total = result.total || 3;
  return (
    <div className="result-page panel">
      <div className="result-star">✦</div>
      <div className="eyebrow">QUIZ COMPLETE</div>
      <h1>{score >= 70 ? "Strong work." : "Good first pass."}</h1>
      <p>
        You scored <b>{Math.round(score)}%</b>. Review the explanation on every
        question, then take another run when you’re ready.
      </p>
      <div className="result-number">
        {Math.round(score)}
        <small>%</small>
      </div>
      <div className="result-stats">
        <span>
          <b>{Math.round((score / 100) * total)}</b> correct
        </span>
        <span>
          <b>+{25 + Math.round((score / 100) * total) * 10}</b> XP earned
        </span>
        <span>
          <b>{total}</b> questions
        </span>
      </div>
      <div className="result-actions">
        <Link className="button" to="/topics">
          Practice another topic →
        </Link>
        <Link className="button secondary" to="/progress">
          View progress
        </Link>
      </div>
    </div>
  );
}

function Leaderboard({
  user,
  xp,
  scores,
}: {
  user: User | null;
  xp: number;
  scores: number[];
}) {
  const myStreak = getWeekStreak();
  // Java-only board: StudyLab currently runs the Java module in the UI.
  const rows = [
    {
      name: "Maya Chen",
      category: "Java",
      xp: 1840,
      quizzes: 31,
      average: 94,
      streak: 18,
    },
    {
      name: "Jordan Lee",
      category: "Java",
      xp: 1620,
      quizzes: 26,
      average: 91,
      streak: 12,
    },
    {
      name: user?.name || "Student",
      category: "Java",
      xp,
      quizzes: scores.length,
      average: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      streak: myStreak,
    },
    {
      name: "Sam Okafor",
      category: "Java",
      xp: 980,
      quizzes: 17,
      average: 82,
      streak: 7,
    },
  ].sort((a, b) => b.xp - a.xp);
  const visibleRows = rows;
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">JAVA COMMUNITY</div>
          <h1>Leaderboard.</h1>
          <p>Compare your Java progress with other StudyLab students.</p>
        </div>
        <span className="pill">THIS MONTH</span>
      </div>
      <div className="podium">
        {visibleRows.slice(0, 3).map((row, i) => (
          <div className={`podium-card p${i}`} key={row.name}>
            <span>{i === 0 ? "♛" : `0${i + 1}`}</span>
            <b>{row.name}</b>
            <strong>{row.xp.toLocaleString()} XP</strong>
            <small>
              {row.average}% avg · {row.streak} week streak
            </small>
          </div>
        ))}
      </div>
      <section className="leaderboard panel">
        <div className="table-head">
          <span>RANK</span>
          <span>STUDENT</span>
          <span>XP / POINTS</span>
          <span>QUIZZES</span>
          <span>AVG SCORE</span>
          <span>STREAK</span>
        </div>
        {visibleRows.map((row, i) => (
          <div
            className={row.name === user?.name ? "table-row you" : "table-row"}
            key={row.name}
          >
            <b>#{i + 1}</b>
            <strong>
              {row.name === user?.name && user.picture ? (
                <img className="leaderboard-avatar" src={user.picture} alt="" />
              ) : (
                <i>{row.name[0]}</i>
              )}
              {row.name}
              {row.name === user?.name && <em>YOU</em>}
            </strong>
            <span>{row.xp.toLocaleString()}</span>
            <span>{row.quizzes}</span>
            <span>{row.average}%</span>
            <span>♨ {row.streak}</span>
          </div>
        ))}
      </section>
    </>
  );
}
// The founder's details live here so the About tab and the auto-updating age
// stay in one place. Age is computed from the birth date every time the page
// renders, so it ticks up in years on its own.
const FOUNDER = {
  name: "Cleophus Tshinyelani",
  role: "Founder of CT TECH",
  university: "Studying Computer Science and Mathematics at university",
  birth: new Date(2007, 1, 18, 8, 43), // 18 February 2007, 08:43
  place: "South Africa",
};

function founderAge(now: Date = new Date()): number {
  let age = now.getFullYear() - FOUNDER.birth.getFullYear();
  const monthDiff = now.getMonth() - FOUNDER.birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < FOUNDER.birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

function Profile({
  user,
  onUpdate,
  onLogout,
}: {
  user: User | null;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user?.name || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [course, setCourse] = useState(user?.degree || "");
  const [picture, setPicture] = useState(user?.picture || "");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"profile" | "terms" | "about">("profile");
  const age = founderAge();
  const degreeTopics =
    degreeCatalog.find((option) => option.name === course)?.topics || [];
  const save = async () => {
    if (!editing) return;
    const next: User = {
      id: user?.id,
      email: user?.email || "",
      name: name.trim() || user?.name || "Student",
      role: user?.role,
      university,
      degree: course,
      picture,
    };
    const token = localStorage.getItem("java-token");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(next),
      });
      const result = await response.json();
      onUpdate(result.user || next);
    } catch {
      onUpdate(next);
    }
    localStorage.setItem("java-user", JSON.stringify(next));
    setEditing(false);
    setSaved(true);
  };
  const removeAccount = async () => {
    if (!window.confirm("Delete your StudyLab account and progress?")) return;
    const token = localStorage.getItem("java-token");
    try {
      if (token)
        await fetch("/api/auth/account", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
    } finally {
      localStorage.clear();
      window.location.href = "/auth";
    }
  };
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR ACCOUNT</div>
          <h1>Account.</h1>
          <p>Your StudyLab identity and account information.</p>
        </div>
        <div className="profile-actions">
          {tab === "profile" &&
            (editing ? (
              <button className="button" onClick={save}>
                {saved ? "Changes saved ✓" : "Save changes"}
              </button>
            ) : (
              <button className="button" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            ))}
        </div>
      </div>

      <div className="leaderboard-tabs account-tabs">
        {(
          [
            ["profile", "Profile"],
            ["terms", "Terms & Conditions"],
            ["about", "About"],
          ] as const
        ).map(([value, label]) => (
          <button
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "terms" && <TermsPanel />}

      {tab === "about" && (
        <section className="panel about-panel">
          <div className="about-head">
            <div className="about-avatar">CT</div>
            <div>
              <span className="eyebrow">{FOUNDER.role.toUpperCase()}</span>
              <h2>{FOUNDER.name}</h2>
              <p className="about-age">
                {age} years old · born 18 February 2007
              </p>
            </div>
          </div>
          <p>
            I am Cleophus Tshinyelani, the founder of CT TECH. I am {age} years
            old and I am studying Computer Science and Mathematics at
            university. I built StudyLab because too many students practise
            questions without ever really understanding what they are doing.
            StudyLab pairs clear, plain-language notes with practice and tests
            built from those same notes, so every answer teaches you something.
          </p>
          <p>
            The goal is simple: help students move from memorising to genuinely
            understanding their subjects, one sub-topic at a time.
          </p>
          <div className="about-facts">
            <span className="pill">CT TECH</span>
            <span className="pill">{FOUNDER.role}</span>
            <span className="pill">Computer Science and Mathematics</span>
          </div>
        </section>
      )}

      {tab === "profile" && (
        <>
          <section className="panel profile-degree">
            <div className="panel-head">
              <div>
                <span className="eyebrow">YOUR DEGREE</span>
                <h2>{course.trim() || "Degree not added yet"}</h2>
                <p>
                  This is the degree or programme you are currently studying.
                  Use Edit profile to update it.
                </p>
                {degreeTopics.length > 0 && (
                  <div className="dashboard-module-list">
                    {degreeTopics.map((topic) => (
                      <span className="pill" key={topic}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="pill">
                {course.trim() ? "ADDED" : "NOT ADDED"}
              </span>
            </div>
          </section>
          <div className="profile-grid">
            <section className="panel profile-card">
              {picture ? (
                <img
                  className="big-avatar profile-picture"
                  src={picture}
                  alt="Profile"
                />
              ) : (
                <div className="big-avatar">{name[0]}</div>
              )}
              <h2>{name}</h2>
              <p>{user?.email}</p>
              <span className="pill">STUDENT</span>
              <hr />
              <div>
                <small>Member since</small>
                <b>September 2026</b>
              </div>
              <div>
                <small>Current focus</small>
                <b>{course.trim() || "Degree not added yet"}</b>
              </div>
            </section>
            <section className="panel profile-form">
              <span className="eyebrow">PERSONAL DETAILS</span>
              <h2>Make it yours.</h2>
              {!editing && (
                <p className="profile-readonly-message">
                  Your information is locked. Press <b>Edit profile</b> above to
                  make changes.
                </p>
              )}
              <label>
                Display name
                <input
                  readOnly={!editing}
                  disabled={!editing}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSaved(false);
                  }}
                />
              </label>
              <label>
                University or college
                <input
                  readOnly={!editing}
                  disabled={!editing}
                  value={university}
                  onChange={(event) => setUniversity(event.target.value)}
                  placeholder="Add your university"
                />
              </label>
              <label>
                Profile picture
                <input
                  disabled={!editing}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setPicture(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <label>
                Degree or programme
                <select
                  disabled={!editing}
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                >
                  <option value="">Select your degree</option>
                  {degreeCatalog.map((option) => (
                    <option key={option.name}>{option.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Email
                <input readOnly disabled value={user?.email || ""} />
              </label>
              <div className="profile-settings-link">
                <div>
                  <b>Preferences</b>
                  <small>
                    Language, theme, daily goal and more now live in Settings.
                  </small>
                </div>
                <Link className="button secondary mini" to="/settings">
                  Open settings <span>→</span>
                </Link>
              </div>
              <div className="account-actions-row">
                <button
                  className="button secondary"
                  type="button"
                  onClick={onLogout}
                >
                  Log out
                </button>
                <button
                  className="button danger"
                  type="button"
                  onClick={removeAccount}
                >
                  Delete account
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function SettingToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="setting-toggle">
      <span className="setting-toggle-copy">
        <b>{label}</b>
        <small>{hint}</small>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? "switch-pill on" : "switch-pill"}
        onClick={() => onChange(!checked)}
      >
        <i />
      </button>
    </label>
  );
}

function Settings({
  dark,
  toggleTheme,
}: {
  dark: boolean;
  toggleTheme: () => void;
}) {
  const [toggles, setToggles] = useState(() => ({
    notifications: localStorage.getItem("study-notifications") !== "off",
    sounds: localStorage.getItem("study-sounds") !== "off",
    autoSave: localStorage.getItem("study-autosave") !== "off",
    showAnswers: localStorage.getItem("study-show-answers") !== "off",
    reduceMotion: localStorage.getItem("study-reduce-motion") === "on",
  }));
  const [language, setLanguage] = useState(
    () => localStorage.getItem("study-language") || "en",
  );
  const [dailyGoal, setDailyGoal] = useState(
    () => localStorage.getItem("study-daily-goal") || "30",
  );
  const [saved, setSaved] = useState(false);

  const setToggle = (key: keyof typeof toggles, value: boolean) => {
    const next = { ...toggles, [key]: value };
    setToggles(next);
    const storageKey =
      key === "showAnswers"
        ? "study-show-answers"
        : key === "reduceMotion"
          ? "study-reduce-motion"
          : `study-${key}`;
    const invertedOff = key === "reduceMotion";
    localStorage.setItem(
      storageKey,
      (value !== invertedOff ? "on" : "off") as string,
    );
    setSaved(true);
  };

  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">PREFERENCES</div>
          <h1>Settings.</h1>
          <p>Adjust how StudyLab looks, behaves and keeps you on track.</p>
        </div>
        <span className="pill">{saved ? "SAVED ✓" : "AUTO-SAVED"}</span>
      </div>

      <section className="panel settings-group">
        <div className="panel-head">
          <div>
            <span className="eyebrow">REGION & LANGUAGE</span>
            <h2>Language</h2>
            <p>Choose the language StudyLab displays. More are coming soon.</p>
          </div>
        </div>
        <label className="setting-field">
          Display language
          <select
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              localStorage.setItem("study-language", event.target.value);
              setSaved(true);
            }}
          >
            <option value="en">English (only available)</option>
          </select>
        </label>
      </section>

      <section className="panel settings-group">
        <div className="panel-head">
          <div>
            <span className="eyebrow">APPEARANCE</span>
            <h2>Theme</h2>
            <p>Switch between light and dark mode. Your choice is remembered.</p>
          </div>
        </div>
        <SettingToggle
          label="Dark mode"
          hint="Use a darker colour scheme across the app"
          checked={dark}
          onChange={toggleTheme}
        />
        <SettingToggle
          label="Reduce motion"
          hint="Limit animations and transitions"
          checked={toggles.reduceMotion}
          onChange={(value) => setToggle("reduceMotion", value)}
        />
      </section>

      <section className="panel settings-group">
        <div className="panel-head">
          <div>
            <span className="eyebrow">STUDY HABITS</span>
            <h2>Practice & reminders</h2>
            <p>Shape how you practise and how StudyLab nudges you.</p>
          </div>
        </div>
        <label className="setting-field">
          Daily study goal
          <select
            value={dailyGoal}
            onChange={(event) => {
              setDailyGoal(event.target.value);
              localStorage.setItem("study-daily-goal", event.target.value);
              setSaved(true);
            }}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </label>
        <SettingToggle
          label="Study reminders"
          hint="Remind me to keep my weekly streak alive"
          checked={toggles.notifications}
          onChange={(value) => setToggle("notifications", value)}
        />
        <SettingToggle
          label="Sound feedback"
          hint="Play a sound when an answer is correct or wrong"
          checked={toggles.sounds}
          onChange={(value) => setToggle("sounds", value)}
        />
      </section>

      <section className="panel settings-group">
        <div className="panel-head">
          <div>
            <span className="eyebrow">QUIZZES & EDITOR</span>
            <h2>Learning behaviour</h2>
            <p>Control how quizzes and the practice lab respond to you.</p>
          </div>
        </div>
        <SettingToggle
          label="Auto-save practice code"
          hint="Keep your Java code in the practice lab between visits"
          checked={toggles.autoSave}
          onChange={(value) => setToggle("autoSave", value)}
        />
        <SettingToggle
          label="Show answers after a quiz"
          hint="Reveal correct answers and explanations when you finish"
          checked={toggles.showAnswers}
          onChange={(value) => setToggle("showAnswers", value)}
        />
      </section>
    </>
  );
}

function TermsPanel() {
  return (
    <section className="panel legal-panel">
      <span className="eyebrow">STUDYLAB LEGAL</span>
      <h2>Terms and Conditions</h2>
      <p>
        StudyLab provides educational practice content for personal learning.
        You are responsible for checking answers and using the service lawfully.
      </p>
      <h3>Your account</h3>
      <p>
        You must register with a valid student email address and keep your
        password secure. Accounts use accurate information and must not be
        shared.
      </p>
      <h3>Acceptable use</h3>
      <p>
        Do not submit confidential, copyrighted, or harmful material. Do not
        attempt to disrupt the service or access other students' accounts.
      </p>
      <h3>Content</h3>
      <p>
        Notes, questions and tests are provided as-is for study. While we work
        to keep everything accurate, always confirm against your own course
        material.
      </p>
      <h3>Privacy</h3>
      <p>
        We store your account details and learning activity to provide the
        service and show your progress, as described in the Privacy Notice.
      </p>
      <p className="legal-note">
        This is a general product notice, not legal advice. Please have a
        qualified lawyer review these terms for your jurisdiction before relying
        on them for legal protection.
      </p>
    </section>
  );
}

export default App;
