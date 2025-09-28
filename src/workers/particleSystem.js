self.onmessage = (e) => {
  const { particles = 0 } = e.data || {}
  self.postMessage({ updated: particles })
}

