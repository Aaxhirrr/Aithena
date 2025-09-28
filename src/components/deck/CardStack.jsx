import SwipeCard from './SwipeCard.jsx'

export default function CardStack({ items = [] }) {
  return (
    <div className="relative w-full h-96">
      {items.map((item, i) => (
        <div key={i} className="absolute inset-0" style={{ transform: `translateY(${i * 6}px) scale(${1 - i * 0.03})` }}>
          <SwipeCard>{item.content || `Card ${i + 1}`}</SwipeCard>
        </div>
      ))}
    </div>
  )
}

