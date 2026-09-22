import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { notesForModule, type SubtopicNote } from "../utils/javaNotes";

// ---------------------------------------------------------------------------
// Notes flow
//
// Step 1  Pick a module (Java is the focus today; Calculus/Physics stay listed
//         as coming soon so the flow is obvious and future-proof).
// Step 2  Pick one or more sub-topics inside that module.
// Step 3  Read the teaching notes for the chosen sub-topics, then jump straight
//         into practice on the same sub-topic.
// ---------------------------------------------------------------------------

type ModuleCard = {
  name: string;
  category: string;
  icon: string;
  active: boolean;
  description: string;
  /** Human count label, e.g. "12 sub-topics". */
  countLabel: string;
};

const noteModules: ModuleCard[] = [
  {
    name: "Java",
    category: "Coding",
    icon: "☕",
    active: true,
    description: "Programming fundamentals, OOP, and practical Java challenges.",
    countLabel: `${notesForModule("Java").length} sub-topics`,
  },
  {
    name: "Mechanics",
    category: "Physics",
    icon: "⚙",
    active: false,
    description: "Motion, forces, energy, and mechanical systems.",
    countLabel: "Coming soon",
  },
  {
    name: "Calculus",
    category: "Mathematics",
    icon: "∫",
    active: false,
    description: "Limits, derivatives, and integration.",
    countLabel: "Coming soon",
  },
];

export function Notes() {
  const [searchParams] = useSearchParams();
  const [module, setModule] = useState(
    searchParams.get("category") === "Java" ? "Java" : "",
  );
  const [selected, setSelected] = useState<string[]>(() => {
    const initial = searchParams.get("module");
    return initial ? [initial] : [];
  });
  // "viewing" is separate from "selected" so a student can tick several
  // sub-topics on step 2 before opening the notes on step 3.
  const [viewing, setViewing] = useState(() => Boolean(searchParams.get("module")));

  const subtopics: SubtopicNote[] = useMemo(
    () => (module ? notesForModule(module) : []),
    [module],
  );

  const toggleSubtopic = (name: string) => {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const selectAll = () =>
    setSelected(
      selected.length === subtopics.length ? [] : subtopics.map((n) => n.subtopic),
    );

  const activeNotes = subtopics.filter((note) => selected.includes(note.subtopic));

  const goToModuleStep = () => {
    setModule("");
    setSelected([]);
    setViewing(false);
  };
  const goToSubtopicStep = () => setViewing(false);

  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">STUDY NOTES</div>
          <h1>Learn it, then practice it.</h1>
          <p>
            Notes that actually teach the sub-topic — the idea, the syntax, worked
            examples and the traps — matched to the questions you will be asked.
          </p>
        </div>
        <Link className="button" to="/test">
          Take a 20-question test <span>→</span>
        </Link>
      </div>

      <ol className="notes-steps" aria-label="Notes progress">
        <li className={module ? "done" : "active"}>
          <b>1</b> Choose a module
        </li>
        <li
          className={
            module ? (viewing && activeNotes.length ? "done" : "active") : ""
          }
        >
          <b>2</b> Choose sub-topics
        </li>
        <li className={viewing && activeNotes.length ? "active" : ""}>
          <b>3</b> Read the notes
        </li>
      </ol>

      {/* STEP 1 — module selection */}
      {!module && (
        <section className="notes-step">
          <div className="module-label">
            <span className="eyebrow">STEP 1</span>
            <h2>Which module do you want notes for?</h2>
          </div>
          <div className="module-cards notes-module-cards">
            {noteModules.map((item) => (
              <button
                className={
                  item.active ? "module-card panel" : "module-card panel disabled"
                }
                type="button"
                disabled={!item.active}
                onClick={() => item.active && setModule(item.name)}
                key={item.name}
              >
                <div className="module-card-icon">{item.icon}</div>
                <div>
                  <span className="eyebrow">
                    {item.active ? "ACTIVE MODULE" : "COMING SOON"}
                  </span>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <span className="text-link">
                    {item.active ? `Open ${item.countLabel} →` : item.countLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 2 — sub-topic selection */}
      {module && !viewing && (
        <section className="notes-step">
          <div className="module-label notes-step-head">
            <div>
              <span className="eyebrow">STEP 2 · {module.toUpperCase()}</span>
              <h2>Choose the sub-topics you want notes on</h2>
              <p className="notes-step-hint">
                Pick as many as you like. Each one teaches the concept, shows the
                syntax, and works through examples.
              </p>
            </div>
            <div className="notes-step-actions">
              <button className="button secondary mini" type="button" onClick={goToModuleStep}>
                ← Change module
              </button>
              <button className="button secondary mini" type="button" onClick={selectAll}>
                {selected.length === subtopics.length && subtopics.length > 0
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>
          </div>
          <div className="subtopic-grid">
            {subtopics.map((note, index) => {
              const isOn = selected.includes(note.subtopic);
              return (
                <button
                  className={isOn ? "subtopic-card selected" : "subtopic-card"}
                  type="button"
                  onClick={() => toggleSubtopic(note.subtopic)}
                  key={note.subtopic}
                >
                  <span className="subtopic-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="subtopic-body">
                    <strong>{note.subtopic}</strong>
                    <small>{note.summary}</small>
                  </span>
                  <span className="subtopic-check">{isOn ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
          <div className="notes-start-bar">
            <span className="pill">
              {selected.length} of {subtopics.length} selected
            </span>
            <button
              className="button"
              type="button"
              disabled={!selected.length}
              onClick={() => setViewing(true)}
            >
              Show my notes <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — the teaching notes */}
      {module && viewing && activeNotes.length > 0 && (
        <section className="notes-step">
          <div className="module-label notes-step-head">
            <div>
              <span className="eyebrow">STEP 3 · {module.toUpperCase()} NOTES</span>
              <h2>
                {activeNotes.length} sub-topic
                {activeNotes.length === 1 ? "" : "s"} to study
              </h2>
            </div>
            <div className="notes-step-actions">
              <button
                className="button secondary mini"
                type="button"
                onClick={goToSubtopicStep}
              >
                ← Choose different sub-topics
              </button>
            </div>
          </div>

          <div className="notes-grid">
            {activeNotes.map((note) => (
              <article className="panel note-card teaching-note" key={note.subtopic}>
                <div className="note-card-head">
                  <span className="pill">{note.module}</span>
                  <span className="eyebrow">{note.subtopic}</span>
                </div>
                <h2>{note.subtopic}</h2>
                <p className="note-summary">{note.summary}</p>

                {note.sections.map((section) => (
                  <div className="note-section" key={section.heading}>
                    <h3>{section.heading}</h3>
                    <p>{section.body}</p>
                    {section.bullets && (
                      <ul className="note-bullets">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div className="note-block">
                  <span className="eyebrow">SYNTAX CHEAT-SHEET</span>
                  <pre className="note-code">{note.syntax.join("\n")}</pre>
                </div>

                {note.examples.map((example) => (
                  <div className="note-block" key={example.label}>
                    <span className="eyebrow">EXAMPLE · {example.label.toUpperCase()}</span>
                    <pre className="note-code example-code">{example.code}</pre>
                    <p className="note-takeaway">
                      <b>Takeaway:</b> {example.takeaway}
                    </p>
                  </div>
                ))}

                <div className="note-block pitfalls-block">
                  <span className="eyebrow">COMMON TRAPS (WHAT MAKES IT HARD)</span>
                  <ul className="note-bullets">
                    {note.pitfalls.map((pitfall) => (
                      <li key={pitfall}>{pitfall}</li>
                    ))}
                  </ul>
                </div>

                <div className="note-block revision-block">
                  <span className="eyebrow">IF YOU GET ONE WRONG, RE-READ</span>
                  <ul className="note-bullets">
                    {note.revision.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="note-actions">
                  <Link
                    className="button mini"
                    to={`/quiz/${encodeURIComponent(note.subtopic)}`}
                  >
                    Practice {note.subtopic} <span>→</span>
                  </Link>
                  <Link className="text-link" to="/test">
                    Or take a mixed 20-question test →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="module-selection-hint">
        <span>✦</span>
        <p>
          Notes and practice are linked: every trap in these notes is what the
          questions test. Read a sub-topic, then press <b>Practice</b> or open the{" "}
          <Link to="/test">timed test</Link> to prove it.
        </p>
      </div>
    </>
  );
}
