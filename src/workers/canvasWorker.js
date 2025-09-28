self.onmessage = (e) => {
  const { type } = e.data || {}
  if (type === 'draw') {
    // placeholder worker logic
    self.postMessage({ ok: true })
  }
}

