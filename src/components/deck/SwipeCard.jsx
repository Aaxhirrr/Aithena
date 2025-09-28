export default function SwipeCard({ children, style = {}, className = '' }) {
  return (
    <div className={`rounded-xl shadow-lg bg-white p-4 touch-pan-y ${className}`} style={style}>
      {children}
    </div>
  )
}

