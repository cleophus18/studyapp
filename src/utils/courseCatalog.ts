export type Course = readonly [name: string, category: string, icon: string];

export const popularCourses: readonly Course[] = [
  ["Java", "Coding", "☕"],
  ["Python", "Coding", "🐍"],
  ["JavaScript", "Coding", "◇"],
  ["C++", "Coding", "⌘"],
  ["Web Development", "Coding", "▤"],
  ["Data Structures", "Coding", "⌘"],
  ["Algorithms", "Coding", "↯"],
  ["SQL & Databases", "Coding", "▦"],
  ["Machine Learning", "Technology", "◉"],
  ["Cybersecurity", "Technology", "◇"],
  ["Calculus", "Mathematics", "∫"],
  ["Algebra", "Mathematics", "∑"],
  ["Statistics", "Mathematics", "◌"],
  ["Geometry", "Mathematics", "△"],
  ["Discrete Mathematics", "Mathematics", "∞"],
  ["Physics", "Science", "⚛"],
  ["Chemistry", "Science", "⚗"],
  ["Biology", "Science", "♧"],
  ["Environmental Science", "Science", "♧"],
  ["Astronomy", "Science", "✦"],
  ["Economics", "Business", "◒"],
  ["Accounting", "Business", "▥"],
  ["Marketing", "Business", "↗"],
  ["Project Management", "Business", "✓"],
  ["Finance", "Business", "$"],
  ["Psychology", "Humanities", "◉"],
  ["Communication", "Humanities", "✎"],
  ["Research Methods", "Humanities", "⌕"],
  ["English Language", "Languages", "Aa"],
  ["Design Thinking", "Creative", "✧"],
];

// Only these courses are surfaced in the UI right now. The rest of the catalog
// above is kept intact so modules can be switched back on later.
export const visibleCourseNames: readonly string[] = ["Java"];

export const visibleCourses: readonly Course[] = popularCourses.filter(([name]) =>
  visibleCourseNames.includes(name),
);
