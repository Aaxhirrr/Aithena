export function distance(a, b) {
  const dx = a.lat - b.lat, dy = a.lng - b.lng
  return Math.hypot(dx, dy)
}

