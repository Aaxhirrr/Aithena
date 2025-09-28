self.onmessage = (e) => {
  const { cmd, points = [] } = e.data || {}
  if (cmd === 'index') {
    self.postMessage({ count: points.length })
  }
}

