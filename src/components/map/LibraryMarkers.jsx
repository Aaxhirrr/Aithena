export default function LibraryMarkers({ libraries = [] }) {
  return (
    <ul className="text-sm text-slate-600">
      {libraries.map((l, i) => (
        <li key={i}>📚 {l.name || `Library ${i + 1}`}</li>
      ))}
    </ul>
  )
}

