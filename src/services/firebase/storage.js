export async function upload(path, file) {
  return { path, size: file?.size || 0 }
}

export async function getUrl(path) {
  return `https://example.com/${encodeURIComponent(path)}`
}

