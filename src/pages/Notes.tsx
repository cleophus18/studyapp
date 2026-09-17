import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const studyNotes = [
  {
    module: "Preliminaries & Functions",
    category: "Calculus",
    title: "Start every calculus problem with the function",
    tips: [
      "Write the domain and identify what the input and output represent.",
      "Sketch a quick graph and mark intercepts, asymptotes, and transformations.",
      "Keep algebra exact until the final line so later limit and derivative work stays accurate.",
    ],
  },
  {
    module: "Limits & Continuity",
    category: "Calculus",
    title: "Pass limits by checking the conditions",
    tips: [
      "Try direct substitution first; only simplify or factor when the result is indeterminate.",
      "For continuity, check that the function is defined, the limit exists, and both values agree.",
      "For infinite limits, inspect the denominator sign from the left and right before deciding the direction.",
    ],
  },
  {
    module: "Differentiation Rules",
    category: "Calculus",
    title: "Differentiate from the outside in",
    tips: [
      "Label products, quotients, and composite functions before choosing a rule.",
      "Use the chain rule for every nested expression and multiply by the derivative of the inside.",
      "Simplify after differentiating, then test the result at an easy value.",
    ],
  },
  {
    module: "Applications",
    category: "Calculus",
    title: "Use derivatives to explain the graph",
    tips: [
      "Find critical points from f′(x) = 0 or where f′ is undefined, then test intervals.",
      "Use f′ for increasing/decreasing behaviour and f″ for concavity and inflection points.",
      "For optimisation, state the quantity being maximised or minimised and check endpoints.",
    ],
  },
  { module: "Machines", category: "Physics", title: "Pass Machines with a free-body diagram", tips: ["Write down the load, effort, and distance before choosing a formula.", "Mechanical advantage is load ÷ effort; keep both forces in newtons.", "For efficiency, compare useful output work with input work and multiply by 100."] },
  { module: "Loops", category: "Java", title: "Pass Loops by tracing one iteration", tips: ["Mark the counter value before and after every iteration.", "Check the stopping condition before changing the loop body.", "Test zero, one, and a normal-sized input to catch boundary mistakes."] },
  { module: "Exception Handling", category: "Java", title: "Pass Exception Handling with safe recovery", tips: ["Keep risky statements inside try and handle the narrowest exception you can.", "Use a helpful message in catch instead of silently swallowing the error.", "Put cleanup in finally when a resource must always be released."] },
  { module: "Data Types", category: "Java", title: "Pass Data Types without losing precision", tips: ["Choose int for whole values and double for measurements or fractions.", "Cast before integer division when the result needs decimals.", "Write the expected type beside each input while planning your solution."] },
];

export function Notes() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("module") || "");
  const initialModule = searchParams.get("module") || "";
  const initialCategory = searchParams.get("category") || studyNotes.find((note) => note.module === initialModule)?.category || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const categories = [...new Set(studyNotes.map((note) => note.category))];
  const modules = selectedCategory
    ? studyNotes.filter((note) => note.category === selectedCategory).map((note) => note.module)
    : [];
  const visible = studyNotes.filter((note) =>
    selectedCategory !== "" && selectedModule !== "" &&
    note.category === selectedCategory &&
    note.module === selectedModule &&
    `${note.module} ${note.category} ${note.title} ${note.tips.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="title-row">
        <div><div className="eyebrow">STUDY NOTES</div><h1>Notes & tips.</h1><p>Practical reminders for passing specific modules with confidence.</p></div>
        <Link className="button" to="/modules">Browse modules <span>→</span></Link>
      </div>
      <div className="notes-controls">
        <label>SUBJECT CATEGORY
          <select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setSelectedModule(""); }}>
            <option value="">Choose a category</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>MODULE
          <select value={selectedModule} disabled={!selectedCategory} onChange={(event) => setSelectedModule(event.target.value)}>
            <option value="">{selectedCategory ? "Choose a module" : "Choose a category first"}</option>
            {modules.map((module) => <option key={module}>{module}</option>)}
          </select>
        </label>
        <div className="search notes-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a module from the calculus PDF..." /></div>
      </div>
      {!selectedCategory && <div className="panel empty">Choose a subject category to see only its related modules and tips.</div>}
      {selectedCategory && !selectedModule && <div className="panel empty">Choose a module from the selected {selectedCategory} category to view its tips.</div>}
      <div className="notes-grid">
        {visible.map((note) => (
          <article className="panel note-card" key={`${note.category}-${note.module}`}>
            {note.category === "Calculus" && <div className="eyebrow">MAT1141 PDF NOTES</div>}
            <div className="note-card-head"><span className="pill">{note.category}</span><span className="eyebrow">{note.module}</span></div>
            <h2>{note.title}</h2>
            <ul>{note.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            <Link className="text-link" to={`/quiz/${note.module}`}>Practice this module →</Link>
          </article>
        ))}
      </div>
      {!visible.length && <div className="panel empty">No notes match that search yet. Try Machines, Loops, or Data Types.</div>}
    </>
  );
}
