export default function FloatingActionButton({ onClick = () => {}, children = '+' }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 right-4 w-14 h-14 rounded-full bg-sky-600 text-white text-2xl shadow-lg grid place-items-center"
      aria-label="Action"
    >
      {children}
    </button>
  )
}

