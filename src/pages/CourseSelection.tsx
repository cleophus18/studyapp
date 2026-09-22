import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { visibleCourses } from "../utils/courseCatalog";
import { degreeCatalog } from "../utils/degreeCatalog";

export function CourseSelection({
  selectedCourses,
  onChange,
  degree,
  onDegreeChange,
}: {
  selectedCourses: string[];
  onChange: (courses: string[]) => void;
  degree: string;
  onDegreeChange: (degree: string) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [customCourse, setCustomCourse] = useState("");
  const [message, setMessage] = useState("");
  const matchingCourses = visibleCourses.filter(([name, category]) =>
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
          <p>Pick the subjects you want in your workspace. You can change this list any time.</p>
          <label className="course-degree-field">
            Degree or programme
            <select value={degree} onChange={(event) => onDegreeChange(event.target.value)}>
              <option value="">Select your degree</option>
              {degreeCatalog.map((option) => <option key={option.name}>{option.name}</option>)}
            </select>
          </label>
        </div>
        <button
          className="button"
          disabled={!selectedCourses.length}
          onClick={() => {
            if (!selectedCourses.length) {
              setMessage("Select the course or subject you are currently studying before continuing.");
              return;
            }
            navigate("/dashboard");
          }}
        >
          Continue to dashboard <span>→</span>
        </button>
      </div>
      {message && <div className="panel course-required-message">{message}</div>}
      {!selectedCourses.length && !message && <div className="panel course-required-message">Please enter the course you do by selecting at least one course below.</div>}
      <div className="course-selection-toolbar">
        <button className="button secondary mini" type="button" onClick={() => setCourseSearchOpen((open) => !open)}>Search for my course</button>
        {courseSearchOpen && <div className="course-search-mini">
          <div className="search module-search"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for your course..." /></div>
        </div>}
        {!courseSearchOpen && <div className="search module-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 30 popular courses..." /></div>}
        <span className="pill">{selectedCourses.length} selected</span>
      </div>
      <div className="course-grid">
        {matchingCourses.map(([name, category, icon]) => {
          const selected = selectedCourses.includes(name);
          return (
            <button
              className={selected ? "course-card selected" : "course-card"}
              onClick={() => toggleCourse(name)}
              key={name}
            >
              <span className="course-icon">{icon}</span>
              <span><small>{category}</small><strong>{name}</strong></span>
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
          <button className="button" type="submit">Add module</button>
        </form>
      </section>
    </div>
  );
}
