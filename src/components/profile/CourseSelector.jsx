export default function CourseSelector({ courses = [], onChange = () => {} }) {
  return (
    <select className="border rounded p-2 w-full" onChange={(e) => onChange(e.target.value)}>
      <option value="">Select course</option>
      {courses.map((c, i) => (
        <option key={i} value={c.id || c}>{c.name || c}</option>
      ))}
    </select>
  )
}

