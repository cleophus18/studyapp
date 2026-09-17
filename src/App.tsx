import { useEffect, useMemo, useState } from "react";
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
    description:
      "Programming fundamentals, OOP, and practical Java challenges.",
  },
  {
    name: "Mechanics",
    category: "Physics",
    icon: "⚙",
    active: true,
    description: "Motion, forces, energy, and mechanical systems.",
  },
  {
    name: "JavaScript",
    category: "Coding",
    icon: "◇",
    active: false,
    description: "Web programming and modern JavaScript practice.",
  },
  {
    name: "Python",
    category: "Coding",
    icon: "🐍",
    active: false,
    description: "Programming, automation, and data foundations.",
  },
  {
    name: "Calculus",
    category: "Mathematics",
    icon: "∫",
    active: true,
    description: "Limits, derivatives, and integration.",
  },
  {
    name: "Integral Calculus",
    category: "Mathematics",
    icon: "∑",
    active: false,
    description: "Areas, antiderivatives, and definite integrals.",
  },
];

const popularCourses = courseCatalog;

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
const calculusTopicIcons = ["∿", "→", "∞", "◌", "d", "ƒ", "⛓", "↔", "π", "H", "Σ", "↗", "≡", "⌁"];
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
    options: ["Write the definition and known conditions", "Guess from the graph", "Ignore the domain", "Round before calculating"],
    answer: 0,
    explanation: "Start from the definition, conditions, and domain before applying a shortcut.",
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
    explanation: "Checking the domain and conditions keeps the calculus argument valid.",
  },
  {
    id: `calculus-${index}-exercise`,
    topic,
    difficulty: "Medium" as Difficulty,
    kind: "written answer",
    prompt: `${topic} exercise: Enter the key word or condition you must state before solving.` ,
    options: [],
    answer: 0,
    textAnswer: "domain",
    explanation: "State the domain and conditions before applying a calculus rule.",
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
    prompt: `${topic} exercise: Write one check you should perform after calculating.` ,
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
    explanation: "A hard calculus solution should name the relevant theorem or rule, show the algebra clearly, and verify the result against the domain or conditions.",
  },
]);
const calculusEquations = [
  ["Limit laws", "lim (f(x) + g(x)) = lim f(x) + lim g(x)"],
  ["Continuity", "f is continuous at a when lim(x→a) f(x) = f(a)"],
  ["Derivative from first principles", "f′(x) = lim(h→0) [f(x + h) − f(x)] / h"],
  ["Power rule", "d/dx [xⁿ] = n xⁿ⁻¹"],
  ["Product rule", "d/dx [uv] = u′v + uv′"],
  ["Quotient rule", "d/dx [u/v] = (u′v − uv′) / v²"],
  ["Chain rule", "d/dx [f(g(x))] = f′(g(x)) · g′(x)"],
  ["Exponential function", "d/dx [eˣ] = eˣ"],
  ["Logarithm", "d/dx [ln x] = 1/x,  x > 0"],
  ["Trigonometric functions", "d/dx [sin x] = cos x;  d/dx [cos x] = −sin x"],
  ["L’Hôpital’s rule", "lim f/g = lim f′/g′ when the original limit is 0/0 or ∞/∞"],
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
    prompt: "Given f(x) = 2x − 3 and g(x) = 2 − x, find (f + g)(x) and (f − g)(x).",
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
    prompt: "State the three checks needed to prove that f is continuous at x = a.",
    answer: "f(a) must exist, lim(x→a) f(x) must exist, and the limit must equal f(a).",
  },
  {
    topic: "The Derivative",
    prompt: "Use the derivative definition to find the slope of f(x) = x² at x = 3.",
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
    prompt: "Write the first three non-zero terms of the Maclaurin series for eˣ.",
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
    answer: "f′(x) = 3x² − 3 = 0, so x = ±1; the points are (−1, 2) and (1, −2).",
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
const physicsQuestions: Question[] = physicsTopics.flatMap((topic, topicIndex) => [
  {
    id: `physics-${topicIndex}-easy`,
    topic,
    difficulty: "Easy" as Difficulty,
    kind: "multiple-choice",
    prompt: `${topic}: Which approach is the best first step when solving a ${topic.toLowerCase()} problem?`,
    options: ["Name the known values and units", "Guess the answer", "Skip the diagram", "Change units at random"],
    answer: 0,
    explanation: "Listing known values and units makes the relationship and required formula clear.",
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
    explanation: "Dimensional analysis checks that the units on both sides of a calculation agree.",
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
    explanation: "For a difficult physics problem, define the known values, choose the law, keep units consistent, and check whether the final result is physically reasonable.",
  },
]);
const expandedCalculusQuestions = calculusTopics.flatMap((topic, topicIndex) => {
  const baseQuestions = calculusQuestions.filter((question) => question.topic === topic);
  return Array.from({ length: 24 }, (_, variant) => {
    const question = baseQuestions[variant % baseQuestions.length];
    return {
      ...question,
      id: `calculus-${topicIndex}-question-${variant + 1}`,
      prompt: variant < baseQuestions.length
        ? question.prompt
        : `${question.prompt} (Exercise ${variant + 1})`,
    };
  });
});
const allQuestions = [...questions, ...physicsQuestions, ...expandedCalculusQuestions];

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
  void Landing;
  // Legacy inline page implementations remain available for backwards-compatible
  // snapshots while the routed pages live under src/pages.
  void CourseSelection;
  void TimedTest;
  void Notes;
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
                <Navigate to={selectedCourses.length ? "/dashboard" : "/course-selection"} replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to={selectedCourses.length ? "/dashboard" : "/course-selection"} replace />
              ) : (
                <Auth onAuth={authenticate} />
              )
            }
          />
          <Route path="/terms" element={<LegalPage title="Terms and Conditions" />} />
          <Route path="/privacy" element={<LegalPage title="Privacy Notice" />} />
          <Route
            path="/course-selection"
            element={
              <Guard user={user}>
                <Shell
                  user={user}
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <CourseSelectionPage
                    selectedCourses={selectedCourses}
                    onChange={updateCourses}
                    degree={user?.degree || ""}
                    onDegreeChange={(degree) => {
                      if (!user) return;
                      const nextUser = { ...user, degree };
                      setUser(nextUser);
                      localStorage.setItem("java-user", JSON.stringify(nextUser));
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <Dashboard
                    user={user}
                    answered={answered}
                    xp={xp}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <Modules answered={answered} selectedCourses={selectedCourses} />
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <Progress answered={answered} scores={scores} xp={xp} selectedCourses={selectedCourses} />
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <Leaderboard
                    user={user}
                    xp={xp}
                    scores={scores}
                    selectedCourses={selectedCourses}
                  />
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
                  dark={dark}
                  toggleTheme={() => {
                    const next = !dark;
                    setDark(next);
                    localStorage.setItem("java-theme", next ? "dark" : "light");
                  }}
                  logout={logout}
                >
                  <Profile user={user} onUpdate={(nextUser) => setUser(nextUser)} />
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
  return (
    <main className="loading-screen">
      <img src={ctTechLogo} alt="CT TECH logo" />
      <div className="loading-credit">
        Created by <strong>CT TECH</strong>
      </div>
      <div className="loading-wordmark">
        Study<span>Lab</span>
      </div>
      <div className="loading-skeleton">
        <i />
        <i />
        <i />
      </div>
      <div className="loading-line">
        <i />
      </div>
      <p>Loading your learning workspace...</p>
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
function Landing({ user }: { user: User | null }) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link className="logo" to="/">
          <span>⌘</span> Study<span>Lab</span>
        </Link>
        <div>
          <a href="#method">How it works</a>
          <a href="#topics">Modules</a>
          <Link className="button mini" to={user ? "/dashboard" : "/auth"}>
            {user ? "Open lab" : "Sign in"} →
          </Link>
        </div>
      </nav>
      <section className="landing-hero">
        <div>
          <div className="eyebrow">THE FOCUSED LEARNING LAB</div>
          <h1>
            Learn deeply.
            <br />
            <em>Think in code.</em>
          </h1>
          <p>
            Questions, quizzes, and coding challenges for the skills you want to
            build, starting with Java and growing into more modules.
          </p>
          <div className="hero-actions">
            <Link className="button" to={user ? "/dashboard" : "/auth"}>
              {user ? "Continue practicing" : "Start practicing free"}{" "}
              <span>→</span>
            </Link>
            <span className="trust">✦ Built for students who build things</span>
          </div>
        </div>
        <div className="code-art">
          <div className="code-window">
            <div className="dots">
              ● ● ● <span>Main.java</span>
            </div>
            <pre>
              <i>public class</i> <b>Progress</b> {"{"}
              {"\n"} <i>int</i> xp = <mark>1240</mark>;{"\n"} <i>boolean</i>{" "}
              ready = <mark>true</mark>;{"\n"}
              {"\n"} System.out.println({`"Keep going"`});{"\n"}
              {"}"}
            </pre>
            <div className="terminal">
              ✓ Tests passing <span>+20 XP</span>
            </div>
          </div>
          <div className="float-stat">
            <b>86%</b>
            <small>average accuracy</small>
          </div>
        </div>
      </section>
      <section id="method" className="method">
        <div>
          <span>01</span>
          <h3>Answer</h3>
          <p>Short questions turn concepts into active recall.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Understand</h3>
          <p>See the correct answer and explanation instantly.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Build</h3>
          <p>Apply your thinking in coding challenges.</p>
        </div>
      </section>
      <section id="topics" className="landing-topics">
        <div className="eyebrow">ONE WORKSPACE. MANY MODULES.</div>
        <h2>
          Start with Java,
          <br />
          <em>grow from there.</em>
        </h2>
        <p>
          Java is the first module. Calculus and more subjects can be added to
          the same focused practice workspace.
        </p>
        <Link className="text-link" to={user ? "/modules" : "/auth"}>
          Explore the modules →
        </Link>
      </section>
    </main>
  );
}

function Auth({ onAuth }: { onAuth: (user: User, token: string) => void }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions and Privacy Notice to continue.");
      return;
    }
    try {
      const body = register
        ? { name, email, password, university, degree }
        : { email, password };
      const result = await api<{ user: User; token: string }>(
        register ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: JSON.stringify(body) },
      );
      onAuth(result.user, result.token);
      navigate("/course-selection");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };
  return (
    <main className="auth">
      <Link className="logo" to="/">
        <span>⌘</span> Study<span>Lab</span>
      </Link>
      <div className="auth-card">
        <div className="eyebrow">
          {register ? "START YOUR STREAK" : "WELCOME BACK"}
        </div>
        <h1>{register ? "Build your study path." : "Back to the lab."}</h1>
        <p>
          {register
            ? "Tell us where you study so we can recommend relevant modules."
            : "Sign in to keep your progress moving."}
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
                <select required value={degree} onChange={(e) => setDegree(e.target.value)}>
                  <option value="">Select your degree</option>
                  {degreeCatalog.map((option) => <option key={option.name}>{option.name}</option>)}
                </select>
              </label>
            </>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
          <label className="terms-check">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            I accept the <a href="/terms" target="_blank" rel="noreferrer">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Notice</a>.
          </label>
          {error && <div className="error">{error}</div>}
          <button className="button full">
            {register ? "Create account →" : "Sign in →"}
          </button>
        </form>
        <p className="switch">
          {register ? "Already have an account?" : "New to StudyLab?"}{" "}
          <button onClick={() => setRegister(!register)}>
            {register ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </main>
  );
}

function LegalPage({ title }: { title: string }) {
  return <main className="auth"><div className="auth-card legal-page"><div className="eyebrow">STUDYLAB LEGAL</div><h1>{title}</h1><p>StudyLab provides educational practice content for personal learning. You are responsible for checking answers and using the service lawfully.</p><p>Do not submit confidential, copyrighted, or harmful material. Accounts must use accurate information and remain secure. We may store account details and learning activity to provide the service, as described in the Privacy Notice.</p><p>This is a general product notice, not legal advice. Please have a qualified lawyer review these terms for your jurisdiction before relying on them for legal protection.</p><Link className="button" to="/auth">Return to sign in</Link></div></main>;
}

function Shell({
  user,
  dark,
  toggleTheme,
  logout,
  children,
}: {
  user: User | null;
  dark: boolean;
  toggleTheme: () => void;
  logout: () => void;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const links = [
    ["/dashboard", "⌂", "Dashboard"],
    ["/modules", "◈", "Modules"],
    ["/practice", "⌘", "Practice lab"],
    ["/test", "◷", "Timed test"],
    ["/notes", "✎", "Notes & tips"],
    ["/progress", "◔", "My progress"],
    ["/leaderboard", "♛", "Leaderboard"],
  ];
  return (
    <div className="shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="side-logo">
          <Link className="logo" to="/dashboard">
            <span>⌘</span> Study<span>Lab</span>
          </Link>
          <button onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {links.map(([to, icon, label]) => (
            <Link
              className={location.pathname === to ? "active" : ""}
              to={to}
              onClick={() => setOpen(false)}
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
              <b>4 day streak</b>
              <small>+10 XP today</small>
            </div>
          </div>
          <Link className="profile-mini" to="/profile">
            {user?.picture ? <img src={user.picture} alt="" /> : <i>{user?.name[0]}</i>}
            <span>
              <b>{user?.name}</b>
              <small>Student</small>
            </span>
          </Link>
        </div>
      </aside>
      <div className="main">
        <header>
          <button className="hamburger" onClick={() => setOpen(true)}>
            ☰
          </button>
          <span className="breadcrumb">
            StudyLab <b>/</b> {location.pathname.slice(1) || "dashboard"}
          </span>
          <div className="header-actions">
            <button onClick={toggleTheme}>{dark ? "☀" : "◐"}</button>
            <span className="xp-chip">✦ {user ? "Level 4" : ""}</span>
            <button onClick={logout}>Log out</button>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

function CourseSelection({
  selectedCourses,
  onChange,
}: {
  selectedCourses: string[];
  onChange: (courses: string[]) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const visibleCourses = popularCourses.filter(([name, category]) =>
    `${name} ${category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const toggleCourse = (name: string) => {
    onChange(
      selectedCourses.includes(name)
        ? selectedCourses.filter((course) => course !== name)
        : [...selectedCourses, name],
    );
  };
  const addCustomCourse = (event: React.FormEvent) => {
    event.preventDefault();
    const name = customCourse.trim();
    if (!name) return;
    onChange([...selectedCourses, name]);
    setCustomCourse("");
  };
  return (
    <div className="course-selection">
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR STUDY PATH</div>
          <h1>Choose your courses.</h1>
          <p>
            Pick the subjects you want in your workspace. You can change this
            list any time.
          </p>
        </div>
        <button className="button" onClick={() => navigate("/dashboard")}>
          Continue to dashboard <span>→</span>
        </button>
      </div>
      <div className="course-selection-toolbar">
        <div className="search module-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 30 popular courses..."
          />
        </div>
        <span className="pill">{selectedCourses.length} selected</span>
      </div>
      <div className="course-grid">
        {visibleCourses.map(([name, category, icon]) => {
          const selected = selectedCourses.includes(name);
          return (
            <button
              className={selected ? "course-card selected" : "course-card"}
              onClick={() => toggleCourse(name)}
              key={name}
            >
              <span className="course-icon">{icon}</span>
              <span>
                <small>{category}</small>
                <strong>{name}</strong>
              </span>
              <b>{selected ? "✓" : "+"}</b>
            </button>
          );
        })}
      </div>
      <section className="panel add-course">
        <div>
          <span className="eyebrow">CAN'T FIND IT?</span>
          <h2>Add another module</h2>
          <p>Add a course or module that is unique to your programme.</p>
        </div>
        <form onSubmit={addCustomCourse}>
          <input
            value={customCourse}
            onChange={(event) => setCustomCourse(event.target.value)}
            placeholder="e.g. Renewable Energy"
            aria-label="New course name"
          />
          <button className="button" type="submit">
            Add module
          </button>
        </form>
      </section>
    </div>
  );
}

function Dashboard({
  user,
  answered,
  xp,
  selectedCourses,
}: {
  user: User | null;
  answered: string[];
  xp: number;
  selectedCourses: string[];
}) {
  const accuracy = answered.length ? 78 : 0;
  const nextTopic =
    topics[Math.min(Math.floor(answered.length / 3), topics.length - 1)];
  const degree = user?.degree || "your degree";
  const courseModules = selectedCourses.flatMap((course) =>
    course === "Calculus" ? ["Calculus", "Integral Calculus"] : course === "Physics" ? ["Physics", "Mechanics"] : [course],
  );
  const recommended = courseModules.length ? courseModules.slice(0, 6) : ["Choose a course"];
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR STUDY WORKSPACE</div>
          <h1>
            Welcome, {user?.name || "student"} <em>✦</em>
          </h1>
          <p>Here are the modules connected to {degree}.</p>
        </div>
        <Link className="button" to={`/quiz/${nextTopic}`}>
          Start a quiz <span>→</span>
        </Link>
      </div>
      <div className="dashboard-modules panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">RECOMMENDED FOR YOUR DEGREE</span>
            <h2>{degree}</h2>
          </div>
          <Link to="/modules">Browse all →</Link>
        </div>
        <div className="dashboard-module-list">
        {recommended.map((name) => (
            <span className="pill" key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="focus-banner">
        <div className="focus-icon">⌘</div>
        <div>
          <span className="eyebrow">RECOMMENDED NEXT</span>
          <h2>{nextTopic}</h2>
          <p>24 questions available · mixed difficulty · +50 XP</p>
        </div>
        <Link className="button mini" to={`/quiz/${nextTopic}`}>
          Practice now →
        </Link>
      </div>
      <div className="stats">
        <Stat
          icon="◈"
          label="Questions answered"
          value={String(answered.length)}
          detail="+12 this week"
          color="purple"
        />
        <Stat
          icon="◎"
          label="Accuracy"
          value={`${accuracy}%`}
          detail="Keep pushing"
          color="green"
        />
        <Stat
          icon="✦"
          label="Total XP"
          value={xp.toLocaleString()}
          detail="Level 4 · Builder"
          color="orange"
        />
        <Stat
          icon="♨"
          label="Current streak"
          value="4 days"
          detail="Best: 12 days"
          color="blue"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
 <div>
              <span className="eyebrow">YOUR SELECTED MODULES</span>
              <h2>Topics to master</h2>
            </div>
            <Link to="/modules">See all modules →</Link>
          </div>
          {topics.slice(0, 5).map((topic, i) => (
            <div className="topic-line" key={topic}>
              <span className={`topic-icon t${i}`}>{topicIcons[i]}</span>
              <div>
                <b>{topic}</b>
                <small>
                  {answered.filter((id) => id.startsWith(`${i}-`)).length}/24
                  questions answered
                </small>
              </div>
              <div className="tiny-bar">
                <i
                  style={{
                    width: `${(answered.filter((id) => id.startsWith(`${i}-`)).length / 24) * 100}%`,
                  }}
                />
              </div>
              <Link to={`/quiz/${topic}`}>→</Link>
            </div>
          ))}
        </section>
        <section className="panel activity">
          <div className="panel-head">
            <div>
              <span className="eyebrow">QUIZ HISTORY</span>
              <h2>Recent practice</h2>
            </div>
            <Link to="/progress">View all →</Link>
          </div>
          {["Operators", "Loops", "Methods"].map((item, i) => (
            <div className="history-line" key={item}>
              <span className="history-check">{i === 0 ? "✓" : "◌"}</span>
              <div>
                <b>{item} checkpoint</b>
                <small>
                  {i === 0 ? "Completed today" : "Ready to practice"}
                </small>
              </div>
              <strong>{i === 0 ? "86%" : "—"}</strong>
            </div>
          ))}
        </section>
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
  const filtered = moduleCatalog.filter((module) =>
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
          {moduleCatalog.filter((module) => module.active).length} ACTIVE ·{" "}
          {moduleCatalog.filter((module) => !module.active).length} COMING SOON
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
          <Link to="/course-selection">
            Add more modules to your workspace
          </Link>
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
              <Link to={`/quiz/${topic}`} onClick={(event) => event.stopPropagation()}>Practice →</Link>
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
            <div className={`topic-icon t${index}`}>{physicsTopicIcons[index]}</div>
            <div className="topic-card-head">
              <span className="eyebrow">MECHANICS TOPIC {String(index + 1).padStart(2, "0")}</span>
              <span>3 questions</span>
            </div>
            <h2>{topic}</h2>
            <p>{physicsTopicDescriptions[index]}</p>
            <div className="topic-card-foot">
              <div className="tiny-bar"><i style={{ width: "0%" }} /></div>
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
            Review motion, forces, energy, levers, pulleys, and mechanical advantage in one focused module.
          </p>
        </div>
        <Link className="text-link" to="/notes?category=Physics&module=Mechanics">Read tips →</Link>
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
          <p>Follow the complete sequence from the supplied MAT1141 notes, from functions and limits through differentiation and applications.</p>
        </div>
        <button className="button secondary" onClick={onBack}>← All modules</button>
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
            <p>Use these formulas alongside the MAT1141 notes. Check the conditions and domain before applying a shortcut.</p>
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
            className={selectedTopic === topic ? "topic-card selected" : "topic-card"}
            key={topic}
            onClick={() => setSelectedTopic((current) => current === topic ? null : topic)}
          >
            <div className={`topic-icon t${index % 6}`}>{calculusTopicIcons[index]}</div>
            <div className="topic-card-head">
              <span className="eyebrow">CALCULUS TOPIC {String(index + 1).padStart(2, "0")}</span>
              <span>24 questions</span>
            </div>
            <h2>{topic}</h2>
            <p>{calculusTopicDescriptions[index]}</p>
            <div className="topic-card-foot">
              <div className="tiny-bar"><i style={{ width: "0%" }} /></div>
              <Link to={`/quiz/${topic}`}>Practice →</Link>
            </div>
            {selectedTopic === topic && (
              <div className="topic-exercises">
                <span className="eyebrow">TOPIC EXERCISES · TAP TO COLLAPSE</span>
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
                            setRevealedExercises((current) => revealed ? current.filter((item) => item !== exerciseIndex) : [...current, exerciseIndex]);
                          }}
                        >
                          {revealed ? "Hide answer" : "Reveal answer"}
                        </button>
                        {revealed && <div className="exercise-answer"><strong>Answer:</strong> {exercise.answer}</div>}
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
        <p><strong>Use the notes as your roadmap.</strong> Work from definitions to examples, keep your domain restrictions visible, and check every derivative or limit against the conditions in the MAT1141 material.</p>
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
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty | "Mixed">("Mixed");
  const pool = useMemo(
    () =>
      allQuestions.filter(
        (q) =>
          q.topic === topic &&
          (difficulty === "Mixed" || q.difficulty === difficulty),
      ),
    [topic, difficulty],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [challengeCode, setChallengeCode] = useState("");
  const [hardSeconds, setHardSeconds] = useState(600);
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
  const writtenHard = hard && q.kind === "written answer";
  const written = !hard && q.difficulty === "Medium";
  const project = hardChallenges.find((challenge) => challenge.topic === topic) || {
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
    if (hard && writtenHard && !writtenAnswer.trim()) return;
    if (hard && !writtenHard && !challengeCode.trim()) return;
    if (written && !writtenAnswer.trim()) return;
    if (!hard && !written && selected === null) return;
    if (submitted) {
      const correct = hard
        ? writtenHard
          ? writtenAnswer.trim().toLowerCase().includes(q.textAnswer?.toLowerCase() || "show")
          : challengeCode.includes("class") && challengeCode.includes("main")
        : written
          ? writtenAnswer.trim().toLowerCase().replace(/\s+/g, "") ===
            q.textAnswer?.toLowerCase().replace(/\s+/g, "")
          : selected === q.answer;
      const next = [...results, correct];
      setResults(next);
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
        navigate("/results", {
          state: {
            score: Math.round(
              (next.filter(Boolean).length / next.length) * 100,
            ),
            total: next.length,
          },
        });
      } else setIndex(index + 1);
    } else setSubmitted(true);
  };
  const isCorrect = hard
    ? writtenHard
      ? writtenAnswer.trim().toLowerCase().includes(q.textAnswer?.toLowerCase() || "show")
      : challengeCode.includes("class") && challengeCode.includes("main")
    : written
      ? writtenAnswer.trim().toLowerCase().replace(/\s+/g, "") === q.textAnswer?.toLowerCase().replace(/\s+/g, "")
      : selected === q.answer;
  return (
    <>
      <div className="quiz-header">
        <div>
          <Link to="/modules" className="back">
            ← Modules
          </Link>
          <div className="eyebrow">JAVA MODULE · QUIZ</div>
          <h1>{topic} practice</h1>
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
            <span>{hard ? "mini project" : q.kind.replace("-", " ")}</span>
            <span>{hard ? `${Math.floor(hardSeconds / 60)}:${String(hardSeconds % 60).padStart(2, "0")}` : "+40 XP"}</span>
          </div>
          <h2>{hard && !writtenHard ? project?.prompt : q.prompt}</h2>
          {hard && writtenHard ? (
            <textarea
              className="written-answer"
              disabled={submitted}
              value={writtenAnswer}
              onChange={(event) => setWrittenAnswer(event.target.value)}
              placeholder="Show your complete working here..."
            />
          ) : hard ? (
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
            <div
              className={
                hard && isCorrect
                  ? "feedback good"
                  : isCorrect
                    ? "feedback good"
                    : "feedback bad"
              }
            >
              <b>
                {hard
                  ? writtenHard ? (isCorrect ? "Working submitted" : `Expected: ${q.textAnswer}`) : "Project submitted"
                  : isCorrect
                    ? "Correct answer"
                    : `Correct answer: ${written ? q.textAnswer : q.options[q.answer]}`}
              </b>
              <span>
                {hard && !writtenHard
                  ? "Your code was submitted. Make sure it satisfies every project requirement before moving on."
                  : q.explanation}
              </span>
            </div>
          )}
          <button
            className="button submit"
            disabled={
              hard
                ? writtenHard ? !writtenAnswer.trim() : !challengeCode.trim()
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
              : hard
                ? "Submit project"
                : "Submit answer"}{" "}
            <span>→</span>
          </button>
        </main>
        <aside className="quiz-aside panel">
          <span className="eyebrow">HARD MODE</span>
          <h3>Build in 10 minutes.</h3>
          <p>
            Every hard question is a practical mini-project sized for a
            focused ten-minute session. Read the brief, implement it from
            scratch, and submit a complete Java class.
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
        </aside>
      </div>
    </>
  );
}

function Practice() {
  const [module, setModule] = useState("Java");
  const [calculusAnswer, setCalculusAnswer] = useState("");
  const [calculusChecked, setCalculusChecked] = useState(false);
  const calculusPracticeQuestion = calculusQuestions.find((question) => question.difficulty === "Medium") || calculusQuestions[0];
  const [code, setCode] = useState(
    "public class Main {\\n  public static void main(String[] args) {\\n    int[] scores = {82, 91, 76};\\n    double total = 0;\\n    for (int score : scores) total += score;\\n    System.out.println(total / scores.length);\\n  }\\n}",
  );
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
          <div className="eyebrow">CROSS-MODULE PRACTICE</div>
          <h1>Practice lab.</h1>
          <p>
            Choose a module and work hands-on. More labs will appear here as
            modules are released.
          </p>
        </div>
        <select
          className="module-select"
          value={module}
          onChange={(event) => setModule(event.target.value)}
        >
          <option>Java</option>
          <option>Calculus</option>
          <option disabled>JavaScript · coming soon</option>
          <option disabled>Python · coming soon</option>
        </select>
      </div>
      {module === "Calculus" ? (
        <section className="panel calculus-practice-card">
          <span className="eyebrow">CALCULUS · FILL IN THE ANSWER</span>
          <h2>{calculusPracticeQuestion.topic}</h2>
          <p>{calculusPracticeQuestion.prompt}</p>
          <input aria-label="Calculus answer" className="written-answer" value={calculusAnswer} disabled={calculusChecked} onChange={(event) => setCalculusAnswer(event.target.value)} placeholder="Type your answer here" />
          <button className="button" disabled={!calculusAnswer.trim() || calculusChecked} onClick={() => setCalculusChecked(true)}>Check answer</button>
          {calculusChecked && <div className={calculusAnswer.trim().toLowerCase() === calculusPracticeQuestion.textAnswer?.toLowerCase() ? "feedback good" : "feedback bad"}>
            <b>{calculusAnswer.trim().toLowerCase() === calculusPracticeQuestion.textAnswer?.toLowerCase() ? "Correct ✓" : `Answer: ${calculusPracticeQuestion.textAnswer}`}</b>
            <span>{calculusPracticeQuestion.explanation}</span>
          </div>}
        </section>
      ) : module === "Java" ? (
        <>
          <div className="challenge-bar">
            <div>
              <span className="eyebrow">EXERCISE · +40 XP</span>
              <h2>Calculate an average</h2>
              <p>
                Complete the TODO so the program prints <code>83.0</code>.
              </p>
            </div>
            <button
              className="button mini"
              onClick={() => setChallengeDone(true)}
            >
              {challengeDone
                ? "Challenge complete ✓"
                : "Mark challenge complete"}
            </button>
          </div>
          <div className="editor-grid">
            <section className="editor panel">
              <div className="editor-head">
                <span>● ● ● &nbsp; Main.java</span>
                <div>
                  <button
                    onClick={() =>
                      setCode(
                        "public class Main {\\n  public static void main(String[] args) {\\n    int[] scores = {82, 91, 76};\\n    // Find the average score\\n  }\\n}",
                      )
                    }
                  >
                    Reset
                  </button>
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
                Output comes from javac and java on the server, including
                compiler errors.
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
      ) : (
        <div className="panel empty-module">
          <h2>{module} practice is coming soon</h2>
          <p>
            This practice lab is reserved for the future {module} module. Choose
            Java to run code today.
          </p>
        </div>
      )}
    </>
  );
}

const timedTestQuestions = allQuestions
  .filter((question) => question.difficulty === "Easy")
  .slice(0, 10);

function TimedTest() {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(30 * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const finish = () => {
    if (finished) return;
    setFinished(true);
    const correct = timedTestQuestions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    const score = Math.round((correct / timedTestQuestions.length) * 100);
    const history = JSON.parse(localStorage.getItem("study-test-scores") || "[]");
    localStorage.setItem("study-test-scores", JSON.stringify([...history, score]));
    navigate("/results", {
      state: { score, total: timedTestQuestions.length, kind: "timed-test" },
    });
  };
  useEffect(() => {
    if (finished) return;
    if (remaining <= 0) {
      finish();
      return;
    }
    const timer = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [remaining, finished]);
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  return (
    <div className="timed-test">
      <div className="title-row">
        <div>
          <div className="eyebrow">SCORED CHECKPOINT · NOT ON LEADERBOARD</div>
          <h1>30-minute test.</h1>
          <p>Check your understanding across Java and Physics. Your score is private.</p>
        </div>
        <div className={remaining < 300 ? "test-timer warning" : "test-timer"}>
          <span>TIME LEFT</span>
          <b>{minutes}:{seconds}</b>
        </div>
      </div>
      <div className="test-notice panel">
        <span>◷</span>
        <p>
          This is a scored practice test, separate from XP and leaderboard
          rankings. Submit when you are finished or let the timer expire.
        </p>
      </div>
      <div className="test-questions">
        {timedTestQuestions.map((question, index) => (
          <section className="panel test-question" key={question.id}>
            <div className="question-meta">
              <span>Question {index + 1}</span>
              <span>{question.topic}</span>
            </div>
            <h2>{question.prompt}</h2>
            <div className="answers">
              {question.options.map((option, optionIndex) => (
                <button
                  className={answers[question.id] === optionIndex ? "answer selected" : "answer"}
                  disabled={finished}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: optionIndex,
                    }))
                  }
                  key={option}
                >
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <button className="button submit" onClick={finish} disabled={finished}>
        Submit scored test <span>→</span>
      </button>
    </div>
  );
}

const studyNotes = [
  { module: "Mechanics", category: "Physics", title: "Pass Mechanics with a free-body diagram", tips: [
      "Write down the load, effort, and distance before choosing a formula.",
      "Mechanical advantage is load ÷ effort; keep both forces in newtons.",
      "For efficiency, compare useful output work with input work and multiply by 100.",
    ],
  },
  {
    module: "Loops",
    category: "Java",
    title: "Pass Loops by tracing one iteration",
    tips: [
      "Mark the counter value before and after every iteration.",
      "Check the stopping condition before changing the loop body.",
      "Test zero, one, and a normal-sized input to catch boundary mistakes.",
    ],
  },
  {
    module: "Exception Handling",
    category: "Java",
    title: "Pass Exception Handling with safe recovery",
    tips: [
      "Keep risky statements inside try and handle the narrowest exception you can.",
      "Use a helpful message in catch instead of silently swallowing the error.",
      "Put cleanup in finally when a resource must always be released.",
    ],
  },
  {
    module: "Data Types",
    category: "Java",
    title: "Pass Data Types without losing precision",
    tips: [
      "Choose int for whole values and double for measurements or fractions.",
      "Cast before integer division when the result needs decimals.",
      "Write the expected type beside each input while planning your solution.",
    ],
  },
];

function Notes() {
  const [searchParams] = useSearchParams();
  const initialModule = searchParams.get("module") || "";
  const [query, setQuery] = useState(initialModule);
  const visible = studyNotes.filter((note) =>
    `${note.module} ${note.category} ${note.title} ${note.tips.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">STUDY NOTES</div>
          <h1>Notes & tips.</h1>
          <p>Practical reminders for passing specific modules with confidence.</p>
        </div>
        <Link className="button" to="/modules">Browse modules <span>→</span></Link>
      </div>
      <div className="search notes-search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Machines, Loops, or a module..."
        />
      </div>
      <div className="notes-grid">
        {visible.map((note) => (
          <article className="panel note-card" key={note.module}>
            <div className="note-card-head">
              <span className="pill">{note.category}</span>
              <span className="eyebrow">{note.module}</span>
            </div>
            <h2>{note.title}</h2>
            <ul>
              {note.tips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
            <Link className="text-link" to={`/quiz/${note.module}`}>Practice this module →</Link>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="panel empty">
          No notes match that search yet. Try Machines, Loops, or Data Types.
        </div>
      )}
    </>
  );
}

function Progress({
  answered,
  scores,
  xp,
  selectedCourses,
}: {
  answered: string[];
  scores: number[];
  xp: number;
  selectedCourses: string[];
}) {
  const accuracy = answered.length ? 78 : 0;
  const startedModules = selectedCourses.flatMap((course) =>
    course === "Calculus" ? ["Calculus", "Integral Calculus"] : course === "Physics" ? ["Mechanics"] : [course],
  );
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">YOUR STUDY DATA</div>
          <h1>Progress that compounds.</h1>
          <p>Use your weak spots as a map for what to practice next.</p>
        </div>
        <span className="level-badge">
          LEVEL 4 <b>Builder</b>
        </span>
      </div>
      <div className="progress-hero panel">
        <div className="ring">
          <b>
            {accuracy}
            <small>%</small>
          </b>
        </div>
        <div>
          <span className="eyebrow">OVERALL ACCURACY</span>
          <h2>You’re building strong instincts.</h2>
          <p>Answer more questions to make this picture more accurate.</p>
        </div>
        <div className="hero-stat">
          <small>QUESTIONS</small>
          <b>{answered.length}</b>
          <span>answered</span>
        </div>
        <div className="hero-stat">
          <small>XP EARNED</small>
          <b>{xp}</b>
          <span>total points</span>
        </div>
      </div>
      <section className="panel started-modules-panel">
        <div className="panel-head"><div><span className="eyebrow">MODULES STARTED</span><h2>Your learning journey</h2></div></div>
        <div className="dashboard-module-list">
          {(selectedCourses.length ? selectedCourses : ["No modules started yet"]).map((course) => <span className="pill" key={course}>{course}</span>)}
        </div>
      </section>
      <div className="progress-columns">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">TOPIC MASTERY</span>
              <h2>Strong and weak spots</h2>
            </div>
          </div>
          {(startedModules.length ? startedModules : ["No modules started yet"]).map((module, i) => (
            <div className="mastery" key={module}>
              <div>
                <b>{module}</b>
                <span>{answered.length && i === 0 ? "In progress" : "Started"}</span>
              </div>
              <div className="tiny-bar"><i className={i === 0 ? "good" : ""} style={{ width: `${i === 0 && answered.length ? 38 : 0}%` }} /></div>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">QUIZ HISTORY</span>
              <h2>Recent results</h2>
            </div>
          </div>
          {scores.length ? (
            scores
              .slice(-5)
              .reverse()
              .map((score, i) => (
                <div className="result-line" key={`${score}-${i}`}>
                  <span>✓</span>
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
  selectedCourses,
}: {
  user: User | null;
  xp: number;
  scores: number[];
  selectedCourses: string[];
}) {
  const userCourse = selectedCourses[0] || "Java";
  const userCourseCategory =
    popularCourses.find(([name]) => name === userCourse)?.[1] === "Mathematics"
      ? "Math"
      : popularCourses.find(([name]) => name === userCourse)?.[1] || "Coding";
  const categories = ["Overall", ...new Set(["Coding", "Math", "Physics"])];
  const [category, setCategory] = useState("Overall");
  const rows = [
    {
      name: "Maya Chen",
      category: userCourseCategory,
      xp: 1840,
      quizzes: 31,
      average: 94,
      streak: 18,
    },
    {
      name: "Jordan Lee",
      category: "Math",
      xp: 1620,
      quizzes: 26,
      average: 91,
      streak: 12,
    },
    {
      name: user?.name || "Student",
      category: userCourseCategory,
      xp,
      quizzes: scores.length,
      average: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      streak: 4,
    },
    {
      name: "Sam Okafor",
      category: "Math",
      xp: 980,
      quizzes: 17,
      average: 82,
      streak: 7,
    },
  ].sort((a, b) => b.xp - a.xp);
  const visibleRows =
    category === "Overall"
      ? rows
      : rows.filter(
          (row) =>
            row.category === category ||
            (row.name === user?.name && userCourseCategory === category),
        );
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">
            {category === "Overall"
              ? "ALL STUDYLAB"
              : `${category.toUpperCase()} COMMUNITY`}
          </div>
          <h1>Leaderboard.</h1>
          <p>
            Compare progress across the whole platform or one module category.
          </p>
        </div>
        <span className="pill">THIS MONTH</span>
      </div>
      <div className="leaderboard-tabs">
        {categories.map((item) => (
          <button
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="podium">
        {visibleRows.slice(0, 3).map((row, i) => (
          <div className={`podium-card p${i}`} key={row.name}>
            <span>{i === 0 ? "♛" : `0${i + 1}`}</span>
            <b>{row.name}</b>
            <strong>{row.xp.toLocaleString()} XP</strong>
            <small>
              {row.average}% avg · {row.streak} day streak
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
              {row.name === user?.name && user.picture ? <img className="leaderboard-avatar" src={user.picture} alt="" /> : <i>{row.name[0]}</i>}
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
function Profile({
  user,
  onUpdate,
}: {
  user: User | null;
  onUpdate: (user: User) => void;
}) {
  const [name, setName] = useState(user?.name || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [course, setCourse] = useState(user?.degree || "");
  const [picture, setPicture] = useState(user?.picture || "");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
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
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(next) });
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
      if (token) await fetch("/api/auth/account", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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
          <h1>Profile.</h1>
          <p>Your StudyLab identity and study preferences.</p>
        </div>
        <div className="profile-actions">
          {editing ? <button className="button" onClick={save}>{saved ? "Changes saved ✓" : "Save changes"}</button> : <button className="button" onClick={() => setEditing(true)}>Edit profile</button>}
        </div>
      </div>
      <section className="panel profile-degree">
        <div className="panel-head">
          <div>
            <span className="eyebrow">YOUR DEGREE</span>
            <h2>{course.trim() || "Degree not added yet"}</h2>
            <p>This is the degree or programme you are currently studying. Use Edit profile to update it.</p>
            {degreeTopics.length > 0 && (
              <div className="dashboard-module-list">
                {degreeTopics.map((topic) => <span className="pill" key={topic}>{topic}</span>)}
              </div>
            )}
          </div>
          <span className="pill">{course.trim() ? "ADDED" : "NOT ADDED"}</span>
        </div>
      </section>
      <div className="profile-grid">
        <section className="panel profile-card">
          {picture ? <img className="big-avatar profile-picture" src={picture} alt="Profile" /> : <div className="big-avatar">{name[0]}</div>}
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
          {!editing && <p className="profile-readonly-message">Your information is locked. Press <b>Edit profile</b> above to make changes.</p>}
          <label>
            Display name
            <input readOnly={!editing} disabled={!editing} value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} />
          </label>
          <label>
            University or college
            <input readOnly={!editing} disabled={!editing} value={university} onChange={(event) => setUniversity(event.target.value)} placeholder="Add your university" />
          </label>
          <label>
            Profile picture
            <input disabled={!editing} type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPicture(String(reader.result));
              reader.readAsDataURL(file);
            }} />
          </label>
          <label>
            Degree or programme
            <select disabled={!editing} value={course} onChange={(event) => setCourse(event.target.value)}>
              <option value="">Select your degree</option>
              {degreeCatalog.map((option) => <option key={option.name}>{option.name}</option>)}
            </select>
          </label>
          <label>
            Daily goal
            <select disabled={!editing} defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <button className="button danger" type="button" onClick={removeAccount}>Delete account</button>
        </section>
      </div>
    </>
  );
}

export default App;
