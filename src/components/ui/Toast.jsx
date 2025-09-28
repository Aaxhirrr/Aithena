export function Toast({ message = '', className = '' }) {
  if (!message) return null
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded ${className}`}>
      {message}
    </div>
  )
}

export default Toast

