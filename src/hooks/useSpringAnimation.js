export default function useSpringAnimation() {
  const animate = (to) => Promise.resolve(to)
  return { animate }
}

