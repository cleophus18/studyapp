import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { q, nowIso } from "./connection.js";

const sections = [
  ["intro", "Java Introduction", "Build a strong mental model of the Java platform."],
  ["fundamentals", "Java Fundamentals", "Master the syntax you will use in every Java program."],
  ["conditionals", "Conditional Statements", "Teach your programs how to make decisions."],
  ["loops", "Loops", "Repeat work confidently and avoid infinite loops."],
  ["methods", "Methods", "Break complex problems into reusable, testable pieces."],
  ["arrays", "Arrays", "Store collections of values and process them efficiently."],
  ["strings", "Strings", "Work with text safely, clearly, and efficiently."],
  ["oop", "Object-Oriented Programming", "Model real systems with classes and expressive abstractions."],
  ["advanced", "Advanced Java", "Level up with the APIs and patterns used in production systems."],
  ["projects", "Java Projects", "Turn your knowledge into portfolio-ready applications."],
];
const lessonNames = [
  ["What is Java?", "Java history", "JDK, JRE and JVM", "Installing Java", "Setting up an IDE", "Writing the first Java program", "Compilation and execution"],
  ["Variables", "Data types", "Constants", "Operators", "Type casting", "Input and output", "Scanner", "Comments"],
  ["if", "else", "else if", "nested if", "switch", "ternary operator"],
  ["for", "while", "do-while", "nested loops", "break", "continue"],
  ["Creating methods", "Parameters", "Return values", "Method overloading", "Scope", "Recursion"],
  ["One-dimensional arrays", "Multidimensional arrays", "Array traversal", "Searching", "Sorting"],
  ["String basics", "String methods", "String comparison", "StringBuilder", "StringBuffer"],
  ["Classes", "Objects", "Constructors", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Interfaces"],
  ["Exception handling", "Collections", "ArrayList", "HashMap", "HashSet", "Generics", "File handling", "Packages", "Access modifiers", "Static and final", "Enums", "Lambda expressions", "Streams"],
  ["Calculator", "Login and registration system", "Currency converter", "Student management system", "Banking system", "To-do application", "Quiz application"],
];

const now = nowIso();
const adminEmail = "cleotshinyalei@gmail.com";
q.run("INSERT OR IGNORE INTO modules (slug, title, subtitle, description, icon, color, category, level, estimated_hours, is_published, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)", "java-all-round", "Java All Round", "From first principles to production-ready projects", "Build the confidence to turn ideas into reliable Java applications.", "coffee", "#6d54d9", "Programming", "Beginner to Advanced", 14, now, now);
const module = q.get("SELECT id FROM modules WHERE slug = ?", "java-all-round");
sections.forEach(([slug, title, description], sectionIndex) => {
  q.run("INSERT OR IGNORE INTO sections (module_id, slug, title, description, sort_order) VALUES (?, ?, ?, ?, ?)", module.id, slug, title, description, sectionIndex);
  const section = q.get("SELECT id FROM sections WHERE module_id = ? AND slug = ?", module.id, slug);
  lessonNames[sectionIndex].forEach((title, lessonIndex) => q.run("INSERT OR IGNORE INTO lessons (section_id, slug, title, summary, difficulty, estimated_minutes, xp_reward, content_json, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", section.id, title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, `Learn ${title.toLowerCase()} through clear explanations and practical Java examples.`, sectionIndex > 7 ? "advanced" : sectionIndex > 3 ? "intermediate" : "beginner", sectionIndex === 9 ? 25 : 10, sectionIndex === 9 ? 35 : 20, JSON.stringify([{ type: "paragraph", text: `This lesson introduces ${title.toLowerCase()} with beginner-friendly notes and a practical exercise.` }]), lessonIndex));
  q.run("INSERT OR IGNORE INTO quizzes (section_id, title, description, pass_percent, xp_reward, is_published, created_at, updated_at) VALUES (?, ?, ?, 70, 50, 1, ?, ?)", section.id, `${title} checkpoint`, `Check your understanding of ${title}.`, now, now);
  const quiz = q.get("SELECT id FROM quizzes WHERE section_id = ?", section.id);
  q.run("DELETE FROM quiz_questions WHERE quiz_id = ?", quiz.id);
  const seededQuestions = [
    ["multiple_choice", "easy", `Which statement best describes ${title}?`, JSON.stringify(["It is part of the Java language", "It only works in JavaScript", "It is a database engine", "It is an operating system"]), 0, `This checkpoint focuses on ${title}, a core Java topic.`],
    ["true_false", "medium", `${title} can be practiced with a small, testable Java program.`, JSON.stringify(["True", "False"]), 0, "Small focused examples make it easier to isolate mistakes and understand behavior."],
    ["code_output", "hard", `What should you inspect first when debugging a ${title} problem?`, JSON.stringify(["The compiler/runtime message and failing line", "The color theme", "The file name only", "The keyboard layout"]), 0, "Start with the reported line and message, then reduce the problem to a small reproducible example."],
  ];
  for (let variant = 3; variant < 12; variant += 1) {
    const hard = variant >= 8;
    seededQuestions.push([
      hard ? "code_output" : variant >= 4 ? "multiple_choice" : "true_false",
      hard ? "hard" : variant >= 4 ? "medium" : "easy",
      hard ? `Write a complete ${title} mini project that validates input and prints a useful result.` : `${title} practice question ${variant - 2}: which approach is most maintainable?`,
      JSON.stringify(hard ? ["A complete compiling Main class", "A comment describing the solution", "An empty method", "A copied answer"] : ["A small, testable Java method", "One giant method", "Ignoring compiler errors", "Using unrelated APIs"]),
      0,
      hard ? "Hard mode expects you to write and compile the solution without starter code or hints." : `The best answer keeps ${title} code focused, readable, and testable.`,
    ]);
  }
  seededQuestions.forEach(([type, difficulty, prompt, options, correctIndex, explanation], questionIndex) => q.run("INSERT OR IGNORE INTO quiz_questions (quiz_id, type, difficulty, prompt, options_json, correct_index, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", quiz.id, type, difficulty, prompt, options, correctIndex, explanation, questionIndex));
});
const admin = q.get("SELECT id FROM users WHERE email = ?", config.admin.email);
if (!admin) {
  const result = q.run("INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, 'admin', ?, ?)", config.admin.email, await bcrypt.hash(config.admin.password, 12), config.admin.name, now, now);
  q.run("INSERT INTO user_profiles (user_id, updated_at) VALUES (?, ?)", result.lastInsertRowid, now);
}
const cleotAdmin = q.get("SELECT id FROM users WHERE email = ?", adminEmail);
if (cleotAdmin) {
  q.run("UPDATE users SET role = 'admin', updated_at = ? WHERE id = ?", now, cleotAdmin.id);
} else {
  const result = q.run("INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, 'admin', ?, ?)", adminEmail, await bcrypt.hash("ChangeMe123!", 12), "Cleot Shinyalei", now, now);
  q.run("INSERT INTO user_profiles (user_id, updated_at) VALUES (?, ?)", result.lastInsertRowid, now);
}
console.log(`Seeded Java All Round content. Admin: ${config.admin.email}`);
