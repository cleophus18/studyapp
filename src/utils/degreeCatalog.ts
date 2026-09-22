export type DegreeOption = {
  name: string;
  topics: string[];
};

export const degreeCatalog: DegreeOption[] = [
  {
    name: "Computer Science and Mathematics",
    topics: ["Java", "Data Structures", "Algorithms", "Calculus"],
  },
  {
    name: "Statistics and Mathematics",
    topics: ["Statistics", "Calculus", "Algebra"],
  },
  { name: "Computer Science", topics: ["Java", "Data Structures", "Algorithms"] },
  { name: "Software Engineering", topics: ["Java", "Algorithms", "Web Development"] },
  { name: "Information Technology", topics: ["Java", "Cybersecurity", "SQL & Databases"] },
  { name: "Data Science", topics: ["Python", "Statistics", "Machine Learning"] },
  { name: "Computer Engineering", topics: ["Java", "Physics", "Calculus"] },
  { name: "Electrical Engineering", topics: ["Physics", "Calculus", "Algebra"] },
  { name: "Mechanical Engineering", topics: ["Physics", "Calculus", "Geometry"] },
  { name: "Civil Engineering", topics: ["Physics", "Calculus", "Geometry"] },
  { name: "Mathematics", topics: ["Calculus", "Algebra", "Statistics"] },
  { name: "Physics", topics: ["Physics", "Calculus", "Algebra"] },
  { name: "Chemistry", topics: ["Chemistry", "Calculus", "Statistics"] },
  { name: "Biology", topics: ["Biology", "Statistics", "Chemistry"] },
  { name: "Environmental Science", topics: ["Environmental Science", "Biology", "Statistics"] },
  { name: "Economics", topics: ["Economics", "Statistics", "Calculus"] },
  { name: "Accounting", topics: ["Accounting", "Finance", "Statistics"] },
  { name: "Business Administration", topics: ["Marketing", "Finance", "Project Management"] },
  { name: "Psychology", topics: ["Psychology", "Statistics", "Research Methods"] },
  { name: "Communication", topics: ["Communication", "Research Methods", "English Language"] },
  { name: "Graphic Design", topics: ["Design Thinking", "Communication", "English Language"] },
  { name: "Education", topics: ["Psychology", "Communication", "Research Methods"] },
];
